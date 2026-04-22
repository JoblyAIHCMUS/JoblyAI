import { Injectable } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';
import { InjectPrisma, InjectScylla } from '../decorators/inject.decorator';
import { ChatSummaryResponse, ChatHistoryResponse } from './messages.interface';
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

  async getChatListSummary(userId: string): Promise<ChatSummaryResponse[]> {
    try {
      console.log(
        '🔍 getChatListSummary SERVICE: fetching conversations for userId:',
        userId
      );
      // 1. Get all active conversations for this user from PostgreSQL
      const activeConversations = await this.prisma.conversation.findMany({
        where: { ownerId: userId },
        select: {
          scyllaChatId: true,
          participantId: true,
          lastMessageAt: true,
          lastMessage: true,
          participant: {
            select: { id: true, name: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });
      console.log('📝 Found conversations:', activeConversations.length);

      // 2. Map those specific conversations to include ScyllaDB details
      const chatDetails = await Promise.all(
        activeConversations.map((conv) =>
          this.getChatDetailsByChatId(userId, conv.scyllaChatId, conv)
        )
      );
      console.log(
        '✅ getChatListSummary SERVICE: returning',
        chatDetails.length,
        'chats'
      );
      return chatDetails;
    } catch (error) {
      console.error('❌ getChatListSummary SERVICE ERROR:', error);
      throw error;
    }
  }

  // Helper method that uses the pre-calculated chatId and conversation data
  private async getChatDetailsByChatId(
    userId: string,
    chatId: string,
    conversationData: {
      scyllaChatId: string;
      participantId: string;
      lastMessageAt: Date;
      lastMessage: string | null;
      participant: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
        role: string | null;
      };
    }
  ): Promise<ChatSummaryResponse> {
    try {
      console.log('🔎 getChatDetailsByChatId for chatId:', chatId);
      const seenRes = await this.scylla.execute(
        'SELECT last_read FROM last_seen WHERE user_id = ? AND chat_id = ?',
        [userId, chatId],
        { prepare: true }
      );

      const lastReadTime = seenRes.first()?.last_read;

      // Check if there's a latestMessage in ScyllaDB to determine unread status
      const msgRes = await this.scylla.execute(
        'SELECT message_id FROM messages WHERE chat_id = ? LIMIT 1',
        [chatId],
        { prepare: true }
      );

      const latestMessage = msgRes.first();

      // Handle message_id which may or may not be a TimeUuid with getTimestamp method
      let hasUnread = false;
      if (latestMessage && !lastReadTime) {
        hasUnread = true;
      } else if (latestMessage && lastReadTime) {
        // Try to get timestamp from message_id, handle both TimeUuid objects and plain values
        const messageTimestamp =
          latestMessage.message_id instanceof types.TimeUuid
            ? latestMessage.message_id.getDate().getTime()
            : new Date(latestMessage.message_id).getTime();

        const lastReadTimestamp =
          lastReadTime instanceof types.TimeUuid
            ? lastReadTime.getDate().getTime()
            : new Date(lastReadTime).getTime();

        hasUnread = messageTimestamp > lastReadTimestamp;
      }

      const response: ChatSummaryResponse = {
        chatId,
        participantId: conversationData.participantId,
        participantName: conversationData.participant.name,
        participantRole: conversationData.participant.role,
        participantAvatar: conversationData.participant.avatarUrl,
        latestMessage: conversationData.lastMessage,
        hasUnread: hasUnread || false,
        lastMessageAt: conversationData.lastMessageAt,
        isActive: true, // Set to true as these are from active conversations
      };
      console.log('✅ getChatDetailsByChatId result:', response);
      return response;
    } catch (error) {
      console.error(
        '❌ getChatDetailsByChatId ERROR for chatId:',
        chatId,
        'error:',
        error
      );
      throw error;
    }
  }

  async createConversation(
    userId: string,
    participantId: string
  ): Promise<void> {
    const chatId = MessagesService.getChatId(userId, participantId);

    // Define the common data
    const baseData = { scyllaChatId: chatId };

    await Promise.all([
      // Create for the initiator
      this.prisma.conversation.upsert({
        where: {
          ownerId_participantId: { ownerId: userId, participantId },
        },
        update: {}, // No update needed if it exists
        create: { ...baseData, ownerId: userId, participantId },
      }),
      // Create for the recipient
      this.prisma.conversation.upsert({
        where: {
          ownerId_participantId: {
            ownerId: participantId,
            participantId: userId,
          },
        },
        update: {},
        create: { ...baseData, ownerId: participantId, participantId: userId },
      }),
    ]);
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
      messages: result.rows.map((row) => {
        // Use the built-in .getDate() method instead of manual bit-shifting
        const timestamp =
          row.message_id instanceof types.TimeUuid
            ? row.message_id.getDate()
            : new Date();

        return {
          messageId: row.message_id.toString(),
          senderId: row.sender_id,
          content: row.content,
          timestamp,
        };
      }),
    };
  }
}
