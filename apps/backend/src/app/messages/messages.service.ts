import { Injectable } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';
import { InjectPrisma, InjectScylla } from '../decorators/inject.decorator';
import { ChatStatusResponse, ChatHistoryResponse } from './messages.interface';
import { SendMessageDTO } from './dto/sendMessageDTO';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(
    @InjectScylla() private readonly scylla: Client,
    @InjectPrisma() private readonly prisma: PrismaClient
  ) {}

  private static getChatId(userA: string, userB: string): string {
    return [userA, userB].sort().join(':');
  }

  async sendMessage(senderId: string, dto: SendMessageDTO): Promise<void> {
    const chatId = MessagesService.getChatId(senderId, dto.recipientId);
    const messageId = types.TimeUuid.now();

    const query =
      'INSERT INTO messages (chat_id, message_id, sender_id, content) VALUES (?, ?, ?, ?)';
    await this.scylla.execute(query, [chatId, messageId, senderId, dto.text], {
      prepare: true,
    });

    const senderData = {
      scyllaChatId: chatId,
      ownerId: senderId,
      participantId: dto.recipientId,
    };

    const recipientData = {
      scyllaChatId: chatId,
      ownerId: dto.recipientId,
      participantId: senderId,
    };

    const updatePayload = {
      lastMessage: dto.text,
      lastMessageAt: new Date(),
    };

    await Promise.all([
      this.prisma.conversation.upsert({
        where: {
          ownerId_participantId: {
            ownerId: senderId,
            participantId: dto.recipientId,
          },
        },
        update: updatePayload,
        create: { ...senderData, ...updatePayload },
      }),
      this.prisma.conversation.upsert({
        where: {
          ownerId_participantId: {
            ownerId: dto.recipientId,
            participantId: senderId,
          },
        },
        update: updatePayload,
        create: { ...recipientData, ...updatePayload },
      }),
    ]);
  }

  async markAsRead(senderId: string, recipientId: string): Promise<void> {
    const chatId = MessagesService.getChatId(senderId, recipientId);
    const query =
      'INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())';
    await this.scylla.execute(query, [senderId, chatId], { prepare: true });
  }

  async getChatListSummary(userId: string): Promise<ChatStatusResponse[]> {
    // 1. Get all active conversations for this user from PostgreSQL
    const activeConversations = await this.prisma.conversation.findMany({
      where: { ownerId: userId },
      select: {
        scyllaChatId: true,
        participantId: true,
        participant: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // 2. Map those specific conversations to ScyllaDB details
    return await Promise.all(
      activeConversations.map((conv) =>
        this.getChatDetailsByChatId(userId, conv.scyllaChatId)
      )
    );
  }

  // Helper method that uses the pre-calculated chatId
  private async getChatDetailsByChatId(
    userId: string,
    chatId: string
  ): Promise<ChatStatusResponse> {
    const [msgRes, seenRes] = await Promise.all([
      this.scylla.execute(
        'SELECT content, message_id FROM messages WHERE chat_id = ? LIMIT 1',
        [chatId],
        { prepare: true }
      ),
      this.scylla.execute(
        'SELECT last_read FROM last_seen WHERE user_id = ? AND chat_id = ?',
        [userId, chatId],
        { prepare: true }
      ),
    ]);

    const latestMessage = msgRes.first();
    const lastReadTime = seenRes.first()?.last_read;

    const hasUnread =
      latestMessage &&
      (!lastReadTime ||
        latestMessage.message_id.getTimestamp() > lastReadTime.getTimestamp());

    return {
      chatId,
      latestMessage: latestMessage?.content,
      hasUnread,
    };
  }

  async createConversation(
    userId: string,
    participantId: string
  ): Promise<void> {
    const chatId = MessagesService.getChatId(userId, participantId);
    await this.prisma.conversation.create({
      data: {
        scyllaChatId: chatId,
        ownerId: userId,
        participantId: participantId,
      },
    });
  }

  async getChatHistory(
    senderId: string,
    recipientId: string,
    limit = 50
  ): Promise<ChatHistoryResponse> {
    const chatId = MessagesService.getChatId(senderId, recipientId);
    const query = 'SELECT * FROM messages WHERE chat_id = ? LIMIT ?';

    const result = await this.scylla.execute(query, [chatId, limit], {
      prepare: true,
    });

    return {
      messages: result.rows.map((row) => ({
        messageId: row.message_id,
        senderId: row.sender_id,
        content: row.content,
        timestamp: row.message_id.getTimestamp(),
      })),
    };
  }
}
