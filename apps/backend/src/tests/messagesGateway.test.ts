import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { MessagesGateway } from '../app/messages/messages.gateway';
import { MessagesService } from '../app/messages/messages.service';
import { AuthService } from '../app/auth/auth.service';
import { Socket } from 'socket.io';

// ============ Mock Type Definitions ============
interface MockAuthService {
  validateToken: Mock;
  login: Mock;
  logout: Mock;
}

interface MockMessagesService {
  sendMessage: Mock;
  markAsRead: Mock;
  getChatListSummary: Mock;
  createConversation: Mock;
  getChatHistory: Mock;
}

interface MockServer {
  to: Mock;
  emit: Mock;
  _toMock: Mock;
  _emitMock: Mock;
}

// ============ Mock Data ============
const mockUser1 = {
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockUser2 = {
  id: 'user456',
  name: 'Jane Smith',
  email: 'jane@example.com',
};

const mockSession1 = {
  user: mockUser1,
  token: 'valid-token-1',
};

const mockSession2 = {
  user: mockUser2,
  token: 'valid-token-2',
};

// ============ Mock Socket.IO Server ============
const createMockServer = () => {
  const emitMock = vi.fn();
  const toMock = vi.fn().mockReturnValue({ emit: emitMock }); // Chainable

  return {
    to: toMock,
    emit: vi.fn(), // General emit
    _toMock: toMock,
    _emitMock: emitMock,
  };
};

// ============ Mock Socket ============
const createMockSocket = (userId?: string) => {
  const joinMock = vi.fn();
  const disconnectMock = vi.fn();

  return {
    handshake: {
      headers: {
        authorization: 'Bearer valid-token-1',
      } as Record<string, string | string[]>,
    },
    data: {
      userId: userId,
    },
    join: joinMock,
    disconnect: disconnectMock,
    _joinMock: joinMock,
    _disconnectMock: disconnectMock,
  };
};

// ============ Mock Services ============
// Note: These will be re-instantiated in beforeEach for proper Vitest scoping

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let mockServer: MockServer;
  let mockAuthService: MockAuthService;
  let mockMessagesService: MockMessagesService;

  beforeEach(async () => {
    // 1. Create fresh mock objects
    mockAuthService = {
      validateToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    };

    mockMessagesService = {
      sendMessage: vi.fn(),
      markAsRead: vi.fn(),
      getChatListSummary: vi.fn(),
      createConversation: vi.fn(),
      getChatHistory: vi.fn(),
    };

    mockServer = createMockServer();
    
    // 2. Manually instantiate the gateway with the mock services
    // This bypasses NestJS dependency injection since the real services
    // have complex dependencies (Scylla, Prisma) that we don't need for unit tests
    gateway = new MessagesGateway(
      mockMessagesService as unknown as MessagesService,
      mockAuthService as unknown as AuthService
    );
    
    // 3. Attach the mock server (since @WebSocketServer() decorator doesn't work in tests)
    (gateway as unknown as Record<string, MockServer>).server = mockServer;

    vi.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should authenticate user and join them to their private room', async () => {
      // Arrange
      const client = createMockSocket();
      mockAuthService.validateToken.mockResolvedValue(mockSession1);

      // Act
      await gateway.handleConnection(client as unknown as Socket);

      // Assert
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(
        client.handshake.headers
      );
      expect(client._joinMock).toHaveBeenCalledWith(mockUser1.id);
      expect(client.data.userId).toBe(mockUser1.id);
    });

    it('should disconnect unauthenticated users', async () => {
      // Arrange
      const client = createMockSocket();
      mockAuthService.validateToken.mockResolvedValue(null);

      // Act
      await gateway.handleConnection(client as unknown as Socket);

      // Assert
      expect(client._disconnectMock).toHaveBeenCalled();
    });

    it('should disconnect when session has no user', async () => {
      // Arrange
      const client = createMockSocket();
      mockAuthService.validateToken.mockResolvedValue({ token: 'some-token' }); // No user

      // Act
      await gateway.handleConnection(client as unknown as Socket);

      // Assert
      expect(client._disconnectMock).toHaveBeenCalled();
    });

    it('should handle different user IDs correctly', async () => {
      // Arrange
      const client = createMockSocket();
      mockAuthService.validateToken.mockResolvedValue(mockSession2);

      // Act
      await gateway.handleConnection(client as unknown as Socket);

      // Assert
      expect(client.data.userId).toBe(mockUser2.id);
      expect(client._joinMock).toHaveBeenCalledWith(mockUser2.id);
    });

    it('should handle authentication errors gracefully', async () => {
      // Arrange
      const client = createMockSocket();
      const error = new Error('Token validation failed');
      mockAuthService.validateToken.mockRejectedValue(error);

      // Act & Assert
      await expect(
        gateway.handleConnection(client as unknown as Socket)
      ).rejects.toThrow('Token validation failed');
    });
  });

  describe('handleSendMessage', () => {
    it('should send message and emit to recipient', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;
      const messageText = 'Hello there!';

      const client = createMockSocket(senderId);
      const dto = {
        recipientId,
        text: messageText,
      };

      mockMessagesService.sendMessage.mockResolvedValue(undefined);

      // Act
      const result = await gateway.handleSendMessage(
        client as unknown as Socket,
        dto
      );

      // Assert
      expect(mockMessagesService.sendMessage).toHaveBeenCalledWith(
        senderId,
        dto
      );

      // Verify the server emitted to the recipient's room
      expect(mockServer._toMock).toHaveBeenCalledWith(recipientId);
      expect(mockServer._emitMock).toHaveBeenCalledWith('new_message', {
        senderId,
        content: messageText,
        timestamp: expect.any(Date),
      });

      expect(result).toEqual({ status: 'ok' });
    });

    it('should use the sender ID from socket data', async () => {
      // Arrange
      const senderId = mockUser2.id;
      const recipientId = mockUser1.id;

      const client = createMockSocket(senderId);
      const dto = {
        recipientId,
        text: 'Message from user 2',
      };

      mockMessagesService.sendMessage.mockResolvedValue(undefined);

      // Act
      await gateway.handleSendMessage(
        client as unknown as Socket,
        dto
      );

      // Assert
      expect(mockMessagesService.sendMessage).toHaveBeenCalledWith(
        senderId,
        dto
      );
      expect(mockServer._emitMock).toHaveBeenCalledWith(
        'new_message',
        expect.objectContaining({
          senderId,
        })
      );
    });

    it('should handle service errors when sending message', async () => {
      // Arrange
      const client = createMockSocket(mockUser1.id);
      const dto = {
        recipientId: mockUser2.id,
        text: 'Test message',
      };

      const error = new Error('Failed to save message');
      mockMessagesService.sendMessage.mockRejectedValue(error);

      // Act & Assert
      await expect(
        gateway.handleSendMessage(client as unknown as Socket, dto)
      ).rejects.toThrow('Failed to save message');
    });

    it('should still emit event even if service succeeds', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;

      const client = createMockSocket(senderId);
      const dto = {
        recipientId,
        text: 'Important message',
      };

      mockMessagesService.sendMessage.mockResolvedValue(undefined);

      // Act
      await gateway.handleSendMessage(
        client as unknown as Socket,
        dto
      );

      // Assert - Socket.IO emit should happen after service call succeeds
      // Fix: Access invocationCallOrder correctly via .mock property
      const serviceCallOrder = mockMessagesService.sendMessage.mock.invocationCallOrder[0];
      const emitCallOrder = mockServer._toMock.mock.invocationCallOrder[0];
      expect(serviceCallOrder).toBeLessThan(emitCallOrder);
    });

    it('should emit message with correct structure', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;
      const messageText = 'Structured message';

      const client = createMockSocket(senderId);
      const dto = {
        recipientId,
        text: messageText,
      };

      mockMessagesService.sendMessage.mockResolvedValue(undefined);

      // Act
      await gateway.handleSendMessage(
        client as unknown as Socket,
        dto
      );

      // Assert
      const emitCall = mockServer._emitMock.mock.calls[0];
      expect(emitCall[0]).toBe('new_message');
      expect(emitCall[1]).toHaveProperty('senderId', senderId);
      expect(emitCall[1]).toHaveProperty('content', messageText);
      expect(emitCall[1]).toHaveProperty('timestamp');
      expect(emitCall[1].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('handleMarkRead', () => {
    it('should mark message as read and notify friend', async () => {
      // Arrange
      const userId = mockUser1.id;
      const friendId = mockUser2.id;

      const client = createMockSocket(userId);
      const data = { friendId };

      mockMessagesService.markAsRead.mockResolvedValue(undefined);

      // Act
      await gateway.handleMarkRead(
        client as unknown as Socket,
        data
      );

      // Assert
      expect(mockMessagesService.markAsRead).toHaveBeenCalledWith(
        userId,
        friendId
      );

      // Verify the friend was notified
      expect(mockServer._toMock).toHaveBeenCalledWith(friendId);
      expect(mockServer._emitMock).toHaveBeenCalledWith('message_read', {
        by: userId,
      });
    });

    it('should handle reverse user relationship correctly', async () => {
      // Arrange
      const userId = mockUser2.id;
      const friendId = mockUser1.id;

      const client = createMockSocket(userId);
      const data = { friendId };

      mockMessagesService.markAsRead.mockResolvedValue(undefined);

      // Act
      await gateway.handleMarkRead(
        client as unknown as Socket,
        data
      );

      // Assert
      expect(mockMessagesService.markAsRead).toHaveBeenCalledWith(
        userId,
        friendId
      );
      expect(mockServer._emitMock).toHaveBeenCalledWith(
        'message_read',
        expect.objectContaining({
          by: userId,
        })
      );
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const client = createMockSocket(mockUser1.id);
      const data = { friendId: mockUser2.id };

      const error = new Error('Failed to mark as read');
      mockMessagesService.markAsRead.mockRejectedValue(error);

      // Act & Assert
      await expect(
        gateway.handleMarkRead(client as unknown as Socket, data)
      ).rejects.toThrow('Failed to mark as read');
    });

    it('should use correct user ID from socket data', async () => {
      // Arrange
      const userId = mockUser2.id;
      const friendId = mockUser1.id;

      const client = createMockSocket(userId);
      const data = { friendId };

      mockMessagesService.markAsRead.mockResolvedValue(undefined);

      // Act
      await gateway.handleMarkRead(
        client as unknown as Socket,
        data
      );

      // Assert
      expect(mockMessagesService.markAsRead).toHaveBeenCalledWith(
        userId,
        friendId
      );
      expect(mockServer._emitMock).toHaveBeenCalledWith(
        'message_read',
        expect.objectContaining({
          by: userId,
        })
      );
    });

    it('should emit message_read event with correct structure', async () => {
      // Arrange
      const userId = mockUser1.id;
      const friendId = mockUser2.id;

      const client = createMockSocket(userId);
      const data = { friendId };

      mockMessagesService.markAsRead.mockResolvedValue(undefined);

      // Act
      await gateway.handleMarkRead(
        client as unknown as Socket,
        data
      );

      // Assert
      const emitCall = mockServer._emitMock.mock.calls[0];
      expect(emitCall[0]).toBe('message_read');
      expect(emitCall[1]).toEqual({ by: userId });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple users in different rooms', async () => {
      // Arrange
      const client1 = createMockSocket();
      const client2 = createMockSocket();

      mockAuthService.validateToken
        .mockResolvedValueOnce(mockSession1)
        .mockResolvedValueOnce(mockSession2);

      // Act
      await gateway.handleConnection(client1 as unknown as Socket);
      await gateway.handleConnection(client2 as unknown as Socket);

      // Assert
      expect(client1._joinMock).toHaveBeenCalledWith(mockUser1.id);
      expect(client2._joinMock).toHaveBeenCalledWith(mockUser2.id);
    });

    it('should emit message and receive read notification', async () => {
      // Arrange
      const senderId = mockUser1.id;
      const recipientId = mockUser2.id;

      const senderSocket = createMockSocket(senderId);
      const recipientSocket = createMockSocket(recipientId);

      mockMessagesService.sendMessage.mockResolvedValue(undefined);
      mockMessagesService.markAsRead.mockResolvedValue(undefined);

      // Act - Send message
      const sendDto = {
        recipientId,
        text: 'Test flow message',
      };

      await gateway.handleSendMessage(
        senderSocket as unknown as Socket,
        sendDto
      );

      // Act - Mark as read
      const readData = { friendId: senderId };
      await gateway.handleMarkRead(
        recipientSocket as unknown as Socket,
        readData
      );

      // Assert
      expect(mockMessagesService.sendMessage).toHaveBeenCalled();
      expect(mockMessagesService.markAsRead).toHaveBeenCalled();

      // Verify both events were emitted
      expect(mockServer._toMock).toHaveBeenNthCalledWith(1, recipientId);
      expect(mockServer._toMock).toHaveBeenNthCalledWith(2, senderId);
    });
  });
});
