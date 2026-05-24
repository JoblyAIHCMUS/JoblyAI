import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsGateway } from '../app/notifications/notifications.gateway';
import { AuthService } from '../app/auth/auth.service';
import { Server, Socket } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let authService: AuthService;

  const mockAuthService = {
    validateToken: vi.fn(),
  };

  const mockServer = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  };

  const mockSocket = {
    handshake: {
      headers: { authorization: 'Bearer token' },
    },
    join: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    authService = module.get<AuthService>(AuthService);
    gateway.server = mockServer as unknown as Server;

    // Manually assign to bypass any injection issues in test environment
    (gateway as any).authService = authService;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join notification room if authenticated', async () => {
      mockAuthService.validateToken.mockResolvedValue({ user: { id: 'user-1' } });

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('notifications:user-1');
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect if not authenticated', async () => {
      mockAuthService.validateToken.mockResolvedValue(null);

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('should emit new_notification to user room', () => {
      const notification = { title: 'Hello' };
      gateway.sendNotification('user-1', notification);

      expect(mockServer.to).toHaveBeenCalledWith('notifications:user-1');
      expect(mockServer.emit).toHaveBeenCalledWith('new_notification', notification);
    });
  });
});
