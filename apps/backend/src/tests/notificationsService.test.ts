import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from '../app/notifications/notifications.service';
import { NotificationsGateway } from '../app/notifications/notifications.gateway';
import { PrismaClient } from '@prisma/client';
import { CreateNotificationDTO } from '../app/notifications/dto/create-notification.dto';
import { NotificationType } from '../app/notifications/notification-type.enum';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let gateway: NotificationsGateway;
  let prisma: PrismaClient;

  const mockPrisma = {
    $transaction: vi.fn(),
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    notificationSettings: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
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

    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((operations) =>
      Promise.all(operations)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification and push it via gateway', async () => {
      const dto: CreateNotificationDTO = {
        recipientId: 'user-1',
        type: NotificationType.NEW_JOB,
        title: 'Test Title',
        content: 'Test Content',
        link: '/test',
        metadata: { key: 'value' },
      };

      const mockNotification = {
        id: 1,
        ...dto,
        isRead: false,
        createdAt: new Date(),
      };
      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(dto);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(gateway.sendNotification).toHaveBeenCalledWith(
        'user-1',
        mockNotification
      );
      expect(result).toEqual(mockNotification);
    });

    it('should create a notification without pushing when the matching setting is disabled', async () => {
      const dto: CreateNotificationDTO = {
        recipientId: 'user-1',
        type: NotificationType.APPLICATION_STATUS_UPDATE,
        title: 'Application updated',
        content: 'Your application status changed',
        link: '/candidate/applications',
      };

      const mockNotification = {
        id: 1,
        ...dto,
        metadata: null,
        isRead: false,
        createdAt: new Date(),
      };

      mockPrisma.notification.create.mockResolvedValue(mockNotification);
      mockPrisma.notificationSettings.findUnique.mockResolvedValue({
        userId: 'user-1',
        applicationsEnabled: false,
        jobsEnabled: true,
        recommendationsEnabled: true,
      });

      const result = await service.createNotification(dto);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          recipientId: dto.recipientId,
          type: dto.type,
          title: dto.title,
          content: dto.content,
          link: dto.link,
          metadata: dto.metadata,
        },
      });
      expect(gateway.sendNotification).not.toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    it('should create notifications in batch and load matching settings once', async () => {
      const dtos: CreateNotificationDTO[] = [
        {
          recipientId: 'employer-1',
          type: NotificationType.NEW_APPLICATION,
          title: 'New Job Application',
          content: 'A new candidate has applied',
          link: '/employer/all-applications/1',
        },
        {
          recipientId: 'candidate-1',
          type: NotificationType.APPLICATION_SUBMITTED,
          title: 'Application Submitted',
          content: 'You have successfully applied',
          link: '/candidate/find-jobs/1',
        },
        {
          recipientId: 'candidate-1',
          type: NotificationType.APPLICATION_STATUS_UPDATE,
          title: 'Application Status Updated',
          content: 'Your status changed',
          link: '/candidate/find-jobs/1',
        },
      ];

      const mockNotifications = dtos.map((dto, index) => ({
        id: index + 1,
        ...dto,
        metadata: null,
        isRead: false,
        createdAt: new Date(),
      }));

      mockPrisma.notification.create
        .mockResolvedValueOnce(mockNotifications[0])
        .mockResolvedValueOnce(mockNotifications[1])
        .mockResolvedValueOnce(mockNotifications[2]);
      mockPrisma.notificationSettings.findMany.mockResolvedValue([
        {
          userId: 'employer-1',
          applicationsEnabled: true,
          jobsEnabled: true,
          recommendationsEnabled: true,
        },
        {
          userId: 'candidate-1',
          applicationsEnabled: false,
          jobsEnabled: true,
          recommendationsEnabled: true,
        },
      ]);

      const result = await service.createNotifications(dtos);

      expect(prisma.notification.create).toHaveBeenCalledTimes(3);
      expect(prisma.notificationSettings.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.notificationSettings.findMany).toHaveBeenCalledWith({
        where: { userId: { in: ['employer-1', 'candidate-1'] } },
      });
      expect(gateway.sendNotification).toHaveBeenCalledTimes(1);
      expect(gateway.sendNotification).toHaveBeenCalledWith(
        'employer-1',
        mockNotifications[0]
      );
      expect(result).toEqual(mockNotifications);
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
      const mockNotification = { id: 1, recipientId: 'user-1', isRead: false };
      const updatedNotification = { ...mockNotification, isRead: true };

      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrisma.notification.update.mockResolvedValue(updatedNotification);
      mockPrisma.notification.count.mockResolvedValue(2);

      const result = await service.markAsRead('user-1', 1);

      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isRead: true },
      });
      expect(result.notification).toEqual(updatedNotification);
      expect(result.unreadCount).toBe(2);
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('user-1', 1)).rejects.toThrow();
    });

    it('should throw ForbiddenException if notification belongs to another user', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 1,
        recipientId: 'other-user',
      });

      await expect(service.markAsRead('user-1', 1)).rejects.toThrow();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });
      mockPrisma.notification.count.mockResolvedValue(0);

      const result = await service.markAllAsRead('user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { recipientId: 'user-1', isRead: false },
        data: { isRead: true },
      });
      expect(result.updatedCount).toBe(5);
      expect(result.unreadCount).toBe(0);
    });
  });
});
