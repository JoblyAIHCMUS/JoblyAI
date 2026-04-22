import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { types } from 'cassandra-driver';
import { MessagesService } from '../app/messages/messages.service';

// ============ Mock Data ============
const mockUser1 = {
  id: 'user123',
  name: 'John Doe',
  avatarUrl: 'https://example.com/john.jpg',
};

const mockUser2 = {
  id: 'user456',
  name: 'Jane Smith',
  avatarUrl: 'https://example.com/jane.jpg',
};

const getChatId = (userA: string, userB: string): string => {
  const sorted = [userA, userB].sort();
  return sorted.join(':');
};

const mockChatId = getChatId(mockUser1.id, mockUser2.id);

// Helper to create actual TimeUuid objects so instanceof checks pass
const createMockTimeUuid = (timestamp?: number) => {
  const ts = timestamp ?? Date.now();
  return types.TimeUuid.fromDate(new Date(ts));
};

const createMockMessageId = () => createMockTimeUuid();

const mockConversation = {
  scyllaChatId: mockChatId,
  ownerId: mockUser1.id,
  participantId: mockUser2.id,
  lastMessage: 'Hello there!',
  lastMessageAt: new Date(),
  participant: mockUser2,
};

// ============ Mock Scylla/Cassandra Client ============
const mockScylla = vi.hoisted(() => ({
  execute: vi.fn(),
}));

// ============ Mock Prisma Client ============
const mockPrisma = vi.hoisted(() => ({
  conversation: {
    findMany: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
}));

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: 'SCYLLA_CLIENT',
          useValue: mockScylla,
        },
        {
          provide: 'PRISMA_CLIENT',
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message and upsert conversations for both users', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;
      const messageText = 'Hello there!';
      const sendMessageDto = {
        recipientId,
        text: messageText,
      };

      mockScylla.execute.mockResolvedValue({ rows: [] });
      mockPrisma.conversation.upsert.mockResolvedValue({ id: 1 });

      // Act
      await service.sendMessage(senderId, sendMessageDto);

      // Assert
      expect(mockScylla.execute).toHaveBeenCalledWith(
        'INSERT INTO messages (chat_id, message_id, sender_id, content) VALUES (?, ?, ?, ?)',
        expect.arrayContaining([
          mockChatId,
          expect.any(Object),
          senderId,
          messageText,
        ]),
        { prepare: true }
      );

      // Verify both conversations were upserted
      expect(mockPrisma.conversation.upsert).toHaveBeenCalledTimes(2);

      // Check sender's conversation
      expect(mockPrisma.conversation.upsert).toHaveBeenNthCalledWith(1, {
        where: {
          ownerId_participantId: {
            ownerId: senderId,
            participantId: recipientId,
          },
        },
        update: {
          lastMessage: messageText,
          lastMessageAt: expect.any(Date),
        },
        create: {
          scyllaChatId: mockChatId,
          ownerId: senderId,
          participantId: recipientId,
          lastMessage: messageText,
          lastMessageAt: expect.any(Date),
        },
      });

      // Check recipient's conversation
      expect(mockPrisma.conversation.upsert).toHaveBeenNthCalledWith(2, {
        where: {
          ownerId_participantId: {
            ownerId: recipientId,
            participantId: senderId,
          },
        },
        update: {
          lastMessage: messageText,
          lastMessageAt: expect.any(Date),
        },
        create: {
          scyllaChatId: mockChatId,
          ownerId: recipientId,
          participantId: senderId,
          lastMessage: messageText,
          lastMessageAt: expect.any(Date),
        },
      });
    });

    it('should handle ScyllaDB execution errors gracefully', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;
      const sendMessageDto = {
        recipientId,
        text: 'Test message',
      };

      const error = new Error('ScyllaDB connection error');
      mockScylla.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.sendMessage(senderId, sendMessageDto)
      ).rejects.toThrow('ScyllaDB connection error');
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read in ScyllaDB', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;

      mockScylla.execute.mockResolvedValue({ rows: [] });

      // Act
      await service.markAsRead(senderId, recipientId);

      // Assert
      expect(mockScylla.execute).toHaveBeenCalledWith(
        'INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())',
        [senderId, mockChatId],
        { prepare: true }
      );
    });

    it('should handle reverse order user IDs correctly', async () => {
      // Arrange
      const senderId = mockUser2.id;
      const recipientId = mockUser1.id;

      mockScylla.execute.mockResolvedValue({ rows: [] });

      // Act
      await service.markAsRead(senderId, recipientId);

      // Assert
      // Chat ID should be the same regardless of user order
      expect(mockScylla.execute).toHaveBeenCalledWith(
        'INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())',
        [senderId, mockChatId],
        { prepare: true }
      );
    });
  });

  describe('getChatListSummary', () => {
    it('should return chat status for all active conversations', async () => {
      // Arrange
      const userId = mockUser1.id;
      const lastMessageDate = new Date();
      const conversation = {
        scyllaChatId: mockChatId,
        participantId: mockUser2.id,
        lastMessageAt: lastMessageDate,
        lastMessage: 'Hello there!',
        participant: { ...mockUser2, role: null },
      };

      mockPrisma.conversation.findMany.mockResolvedValue([conversation]);

      // Mock the ScyllaDB responses for message and seen data
      // Message timestamp should be OLDER than read timestamp for it to show as read
      const messageTimestamp = Date.now();
      const messageId = createMockTimeUuid(messageTimestamp);
      const mockMessageRow = {
        message_id: messageId,
      };

      const lastReadId = createMockTimeUuid(messageTimestamp + 1000); // 1 second AFTER message

      // IMPORTANT: The service queries last_read FIRST, then message_id
      mockScylla.execute
        .mockResolvedValueOnce({ first: () => ({ last_read: lastReadId }) }) // 1st call: SELECT last_read
        .mockResolvedValueOnce({ first: () => mockMessageRow }); // 2nd call: SELECT message_id

      // Act
      const result = await service.getChatListSummary(userId);

      // Assert
      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith({
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

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        chatId: mockChatId,
        participantId: mockUser2.id,
        participantName: mockUser2.name,
        participantRole: null,
        participantAvatar: mockUser2.avatarUrl,
        latestMessage: 'Hello there!',
        hasUnread: false,
        lastMessageAt: lastMessageDate,
        isActive: true,
      });
    });

    it('should mark a chat as unread when last message is newer than last read', async () => {
      // Arrange
      const userId = mockUser1.id;
      const lastMessageDate = new Date();
      const conversation = {
        scyllaChatId: mockChatId,
        participantId: mockUser2.id,
        lastMessageAt: lastMessageDate,
        lastMessage: 'New message',
        participant: { ...mockUser2, role: null },
      };

      mockPrisma.conversation.findMany.mockResolvedValue([conversation]);

      // Create two timestamps where message is NEWER than read
      const olderReadTimestamp = Date.now();
      const newerMessageTimestamp = olderReadTimestamp + 1000; // 1 second later

      const messageTimeUuid = createMockTimeUuid(newerMessageTimestamp);
      const readTimeUuid = createMockTimeUuid(olderReadTimestamp);

      // IMPORTANT: The service queries last_read FIRST, then message_id
      mockScylla.execute
        .mockResolvedValueOnce({ first: () => ({ last_read: readTimeUuid }) }) // 1st call: SELECT last_read
        .mockResolvedValueOnce({
          first: () => ({ message_id: messageTimeUuid }),
        }); // 2nd call: SELECT message_id

      // Act
      const result = await service.getChatListSummary(userId);

      // Assert
      // Message timestamp (newer) > Read timestamp (older) = true (unread)
      expect(result[0].hasUnread).toBe(true);
    });

    it('should handle empty conversation list', async () => {
      // Arrange
      const userId = mockUser1.id;
      mockPrisma.conversation.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getChatListSummary(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle missing last_read timestamp', async () => {
      // Arrange
      const userId = mockUser1.id;
      const lastMessageDate = new Date();
      const conversation = {
        scyllaChatId: mockChatId,
        participantId: mockUser2.id,
        lastMessageAt: lastMessageDate,
        lastMessage: 'First message',
        participant: { ...mockUser2, role: null },
      };

      mockPrisma.conversation.findMany.mockResolvedValue([conversation]);

      const messageId = createMockMessageId();

      // IMPORTANT: The service queries last_read FIRST, then message_id
      mockScylla.execute
        .mockResolvedValueOnce({ first: () => null }) // 1st call: SELECT last_read returns null
        .mockResolvedValueOnce({ first: () => ({ message_id: messageId }) }); // 2nd call: SELECT message_id

      // Act
      const result = await service.getChatListSummary(userId);

      // Assert
      expect(result[0].hasUnread).toBe(true); // Should be unread if no seen record
    });

    it('should handle conversations without latest message', async () => {
      // Arrange
      const userId = mockUser1.id;
      const lastMessageDate = new Date();
      const conversation = {
        scyllaChatId: mockChatId,
        participantId: mockUser2.id,
        lastMessageAt: lastMessageDate,
        lastMessage: null,
        participant: { ...mockUser2, role: null },
      };

      mockPrisma.conversation.findMany.mockResolvedValue([conversation]);

      // IMPORTANT: The service queries last_read FIRST, then message_id
      mockScylla.execute
        .mockResolvedValueOnce({ first: () => null }) // 1st call: SELECT last_read returns null
        .mockResolvedValueOnce({ first: () => null }); // 2nd call: SELECT message_id returns null

      // Act
      const result = await service.getChatListSummary(userId);

      // Assert
      expect(result[0]).toMatchObject({
        chatId: mockChatId,
        latestMessage: null,
        hasUnread: false,
        participantId: mockUser2.id,
      });
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      // Arrange
      const userId = mockUser1.id;
      const participantId = mockUser2.id;

      mockPrisma.conversation.upsert.mockResolvedValue({
        id: 1,
        ...mockConversation,
      });

      // Act
      await service.createConversation(userId, participantId);

      // Assert
      // Should upsert for the initiator
      expect(mockPrisma.conversation.upsert).toHaveBeenNthCalledWith(1, {
        where: {
          ownerId_participantId: {
            ownerId: userId,
            participantId: participantId,
          },
        },
        update: {},
        create: {
          scyllaChatId: mockChatId,
          ownerId: userId,
          participantId: participantId,
        },
      });

      // Should upsert for the recipient
      expect(mockPrisma.conversation.upsert).toHaveBeenNthCalledWith(2, {
        where: {
          ownerId_participantId: {
            ownerId: participantId,
            participantId: userId,
          },
        },
        update: {},
        create: {
          scyllaChatId: mockChatId,
          ownerId: participantId,
          participantId: userId,
        },
      });
    });

    it('should handle reverse order user IDs correctly', async () => {
      // Arrange
      const userId = mockUser2.id;
      const participantId = mockUser1.id;

      mockPrisma.conversation.upsert.mockResolvedValue({
        id: 1,
      });

      // Act
      await service.createConversation(userId, participantId);

      // Assert
      // Should upsert for the initiator
      expect(mockPrisma.conversation.upsert).toHaveBeenNthCalledWith(1, {
        where: {
          ownerId_participantId: {
            ownerId: userId,
            participantId: participantId,
          },
        },
        update: {},
        create: {
          scyllaChatId: mockChatId, // Should be the same sorted ID
          ownerId: userId,
          participantId: participantId,
        },
      });

      // Should upsert for the recipient
      expect(mockPrisma.conversation.upsert).toHaveBeenNthCalledWith(2, {
        where: {
          ownerId_participantId: {
            ownerId: participantId,
            participantId: userId,
          },
        },
        update: {},
        create: {
          scyllaChatId: mockChatId, // Should be the same sorted ID
          ownerId: participantId,
          participantId: userId,
        },
      });
    });
  });

  describe('getChatHistory', () => {
    it('should retrieve chat history with default limit', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;

      const messageId1 = createMockMessageId();
      const messageId2 = createMockMessageId();

      const mockMessages = [
        {
          message_id: messageId1,
          sender_id: senderId,
          content: 'First message',
        },
        {
          message_id: messageId2,
          sender_id: recipientId,
          content: 'Second message',
        },
      ];

      mockScylla.execute.mockResolvedValue({
        rows: mockMessages,
      });

      // Act
      const result = await service.getChatHistory(senderId, recipientId);

      // Assert
      expect(mockScylla.execute).toHaveBeenCalledWith(
        'SELECT * FROM messages WHERE chat_id = ? LIMIT ?',
        [mockChatId, 50],
        { prepare: true }
      );

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0]).toEqual({
        messageId: messageId1.toString(),
        senderId: senderId,
        content: 'First message',
        timestamp: expect.any(Date), // getDate() returns a Date object
      });
    });

    it('should retrieve chat history with custom limit', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;
      const customLimit = 100;

      mockScylla.execute.mockResolvedValue({
        rows: [],
      });

      // Act
      await service.getChatHistory(senderId, recipientId, customLimit);

      // Assert
      expect(mockScylla.execute).toHaveBeenCalledWith(
        'SELECT * FROM messages WHERE chat_id = ? LIMIT ?',
        [mockChatId, customLimit],
        { prepare: true }
      );
    });

    it('should return empty array when no messages exist', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;

      mockScylla.execute.mockResolvedValue({
        rows: [],
      });

      // Act
      const result = await service.getChatHistory(senderId, recipientId);

      // Assert
      expect(result.messages).toEqual([]);
    });

    it('should include message metadata in response', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;
      const messageId = createMockMessageId();

      const mockMessages = [
        {
          message_id: messageId,
          sender_id: senderId,
          content: 'Test message',
        },
      ];

      mockScylla.execute.mockResolvedValue({
        rows: mockMessages,
      });

      // Act
      const result = await service.getChatHistory(senderId, recipientId);

      // Assert
      expect(result.messages[0]).toHaveProperty('messageId');
      expect(result.messages[0]).toHaveProperty('senderId');
      expect(result.messages[0]).toHaveProperty('content');
      expect(result.messages[0]).toHaveProperty('timestamp');
    });
  });

  describe('getChatId (static method)', () => {
    it('should generate consistent chat ID regardless of user order', async () => {
      // This test verifies the chat ID generation logic works correctly
      const userId1 = 'user123';
      const userId2 = 'user456';

      // Create service instance to access the method through a mock
      // The method is private but we can verify behavior through other methods
      const sendDto1 = { recipientId: userId2, text: 'test' };
      const sendDto2 = { recipientId: userId1, text: 'test' };

      mockScylla.execute.mockResolvedValue({ rows: [] });
      mockPrisma.conversation.upsert.mockResolvedValue({ id: 1 });

      // Act
      await service.sendMessage(userId1, sendDto1);
      await service.sendMessage(userId2, sendDto2);

      // Assert - both should use the same sorted chat ID
      // First sendMessage makes 1 scylla call + 2 prisma calls
      // Second sendMessage makes 1 more scylla call + 2 more prisma calls
      const firstScyllaCall = (
        mockScylla.execute.mock.calls[0] as unknown[]
      )[1] as unknown[];
      const secondScyllaCall = (
        mockScylla.execute.mock.calls[1] as unknown[]
      )[1] as unknown[];

      expect(firstScyllaCall[0]).toBe(secondScyllaCall[0]); // Chat ID should be identical
    });
  });
});
