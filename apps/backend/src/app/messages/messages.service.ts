import { Injectable } from "@nestjs/common";
import { Client, types } from "cassandra-driver";
import { InjectScylla } from "../decorators/inject.decorator";
import { ChatStatusResponse } from "./messages.interface";
import { SendMessageDTO } from "./dto/sendMessageDTO";

@Injectable()
export class MessagesService {
    constructor(@InjectScylla() private readonly scylla: Client) {}

    private static getChatId(userA: string, userB: string): string {
        return [userA, userB].sort().join(':');
    }

    async sendMessage(senderId: string, dto: SendMessageDTO): Promise<void> {
        const chatId = MessagesService.getChatId(senderId, dto.recipientId);
        const messageId = types.TimeUuid.now();

        const query = 'INSERT INTO messages (chat_id, message_id, sender_id, content) VALUES (?, ?, ?, ?)';
        await this.scylla.execute(query, [chatId, messageId, senderId, dto.text], { prepare: true });
    }

    async markAsRead(senderId: string, recipientId: string): Promise<void> {
        const chatId = MessagesService.getChatId(senderId, recipientId);
        const query = 'INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())';
        await this.scylla.execute(query, [senderId, chatId], { prepare: true });
    }

    async getChatDetails(senderId: string, recipientId: string): Promise<ChatStatusResponse> {
        const chatId = MessagesService.getChatId(senderId, recipientId);
        const [msgRes, seenRes] = await Promise.all([
            this.scylla.execute('SELECT * FROM messages WHERE chat_id = ? LIMIT 1', [chatId], { prepare: true }),
            this.scylla.execute('SELECT last_read FROM last_seen WHERE user_id = ? AND chat_id = ?', [senderId, chatId], { prepare: true })
        ]);
        const latestMessage = msgRes.first();
        const lastReadTime = seenRes.first()?.last_read;

        const hasUnread = !latestMessage || !lastReadTime || latestMessage.message_id.getTimestamp() > lastReadTime.getTimestamp();

        return {
            chatId,
            latestMessage: latestMessage?.content,
            hasUnread,
        };
    }

    async getChatListSummary(userId: string, friendIds: string[]): Promise<ChatStatusResponse[]> {
        return await Promise.all(
            friendIds.map(fId => this.getChatDetails(userId, fId))
        );
    }
}