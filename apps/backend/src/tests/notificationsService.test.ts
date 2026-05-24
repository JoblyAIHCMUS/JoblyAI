import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from '../app/notifications/notifications.service';
import { NotificationsGateway } from '../app/notifications/notifications.gateway';
import { PrismaClient } from '@prisma/client';
import { CreateNotificationDTO } from '../app/notifications/dto/create-notification.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let gateway: NotificationsGateway;
  let prisma: PrismaClient;

  const mockPrisma = {
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const mockGateway = {
    sendNotification: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: 'PRISMA_CLIENT', useValue: mockPrisma },
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    prisma = module.get<PrismaClient>('PRISMA_CLIENT');

    // Ensure they are correctly assigned (handle any race conditions or injection issues)
    (service as any).prisma = prisma;
    (service as any).notificationsGateway = gateway;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification and push it via gateway', async () => {
      const dto: CreateNotificationDTO = {
        recipientId: 'user-1',
        type: 'TEST_TYPE',
        title: 'Test Title',
        content: 'Test Content',
        link: '/test',
        metadata: { key: 'value' },
      };

      const mockNotification = { id: 1, ...dto, isRead: false, createdAt: new Date() };
      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(dto);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(gateway.sendNotification).toHaveBeenCalledWith('user-1', mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getNotifications', () => {
    it('should return notifications for a user', async () => {
      const mockNotifications = [{ id: 1, recipientId: 'user-1' }];
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.getNotifications('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { recipientId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { recipientId: 'user-1', isRead: false },
      });
      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markAsRead('user-1', 1);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 1, recipientId: 'user-1' },
        data: { isRead: true },
      });
    });
  });
});
