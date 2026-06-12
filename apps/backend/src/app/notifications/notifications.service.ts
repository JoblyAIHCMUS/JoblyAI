import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectPrisma } from '../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { RegisterPushTokenDTO } from './dto/push-token.dto';

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
    void this.sendExpoPushNotifications(data.recipientId, {
      title: data.title,
      body: data.content,
      data: {
        notificationId: notification.id,
        type: data.type,
        link: data.link,
        metadata: data.metadata,
      },
    }).catch(() => undefined);

    return notification;
  }

  async registerPushToken(userId: string, data: RegisterPushTokenDTO) {
    return (this.prisma as any).pushNotificationToken.upsert({
      where: { token: data.token },
      update: {
        userId,
        platform: data.platform,
        deviceId: data.deviceId,
      },
      create: {
        userId,
        token: data.token,
        platform: data.platform,
        deviceId: data.deviceId,
      },
    });
  }

  async unregisterPushToken(userId: string, token: string) {
    await (this.prisma as any).pushNotificationToken.deleteMany({
      where: { userId, token },
    });

    return { success: true };
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

  private async sendExpoPushNotifications(
    userId: string,
    message: {
      title: string;
      body: string;
      data?: Record<string, unknown>;
    }
  ) {
    const tokens = await (this.prisma as any).pushNotificationToken.findMany({
      where: { userId, platform: 'android' },
      select: { token: true },
    });

    if (!tokens.length) {
      return;
    }

    const pushMessages = tokens.map(({ token }: { token: string }) => ({
      to: token,
      sound: 'default',
      title: message.title,
      body: message.body,
      data: message.data,
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushMessages),
      });

      if (!response.ok) {
        return;
      }

      const result = (await response.json()) as {
        data?: Array<{ status?: string; details?: { error?: string } }>;
      };
      const invalidTokens = result.data
        ?.map((ticket, index) =>
          ticket.status === 'error' &&
          ticket.details?.error === 'DeviceNotRegistered'
            ? pushMessages[index].to
            : null
        )
        .filter(Boolean);

      if (invalidTokens?.length) {
        await (this.prisma as any).pushNotificationToken.deleteMany({
          where: { token: { in: invalidTokens } },
        });
      }
    } catch {
      // Push delivery should never block creating an in-app notification.
    }
  }
}
