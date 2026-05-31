import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectPrisma } from '../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDTO } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  async createNotification(data: CreateNotificationDTO) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link,
        metadata: data.metadata,
      },
    });

    // Push real-time
    this.notificationsGateway.sendNotification(data.recipientId, notification);

    return notification;
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  async markAsRead(userId: string, notificationId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this notification'
      );
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    const unreadCount = await this.getUnreadCount(userId);

    return {
      notification: updatedNotification,
      unreadCount,
    };
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    const unreadCount = await this.getUnreadCount(userId);

    return {
      updatedCount: result.count,
      unreadCount,
    };
  }

  async deleteNotification(userId: string, notificationId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this notification'
      );
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    const unreadCount = await this.getUnreadCount(userId);

    return {
      deletedId: notificationId,
      unreadCount,
    };
  }
}
