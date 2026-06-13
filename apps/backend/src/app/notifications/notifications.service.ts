import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectPrisma } from '../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { UpdateNotificationSettingsDTO } from './dto/update-notification-settings.dto';
import { NotificationType } from './notification-type.enum';

type NotificationPreferenceKey = 'applications' | 'jobs' | 'recommendations';

const DEFAULT_NOTIFICATION_SETTINGS = {
  applications: true,
  jobs: true,
  recommendations: true,
};

type NotificationSettingsFlags = {
  userId: string;
  applicationsEnabled: boolean;
  jobsEnabled: boolean;
  recommendationsEnabled: boolean;
};

const APPLICATION_NOTIFICATION_TYPES = new Set<NotificationType>([
  NotificationType.NEW_APPLICATION,
  NotificationType.APPLICATION_SUBMITTED,
  NotificationType.APPLICATION_STATUS_UPDATE,
  NotificationType.APPLICATION_REJECTED,
]);

const JOB_NOTIFICATION_TYPES = new Set<NotificationType>([
  NotificationType.NEW_JOB,
  NotificationType.JOB_MATCH,
  NotificationType.JOB_RECOMMENDATION,
  NotificationType.SAVED_JOB_UPDATE,
]);

const RECOMMENDATION_NOTIFICATION_TYPES = new Set<NotificationType>([
  NotificationType.AI_RESUME_PARSED,
  NotificationType.AI_RESUME_SCORED,
  NotificationType.RECOMMENDATION,
  NotificationType.PERSONALIZED_RECOMMENDATION,
]);

@Injectable()
export class NotificationsService {
  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  async createNotification(data: CreateNotificationDTO) {
    const notification = await this.createNotificationRecord(data);

    const shouldSendPush = await this.shouldSendRealtimeNotification(
      data.recipientId,
      data.type
    );

    if (shouldSendPush) {
      this.notificationsGateway.sendNotification(
        data.recipientId,
        notification
      );
    }

    return notification;
  }

  async createNotifications(data: CreateNotificationDTO[]) {
    if (data.length === 0) {
      return [];
    }

    const notifications = await this.prisma.$transaction(
      data.map((notification) => this.createNotificationRecord(notification))
    );
    const settingsByUserId = await this.getNotificationSettingsByUserId(data);

    notifications.forEach((notification, index) => {
      const notificationData = data[index];
      const shouldSendPush = this.shouldSendRealtimeNotificationFromSettings(
        notificationData.type,
        settingsByUserId.get(notificationData.recipientId)
      );

      if (shouldSendPush) {
        this.notificationsGateway.sendNotification(
          notificationData.recipientId,
          notification
        );
      }
    });

    return notifications;
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.prisma.notificationSettings.upsert({
      where: { userId },
      create: {
        userId,
        applicationsEnabled: DEFAULT_NOTIFICATION_SETTINGS.applications,
        jobsEnabled: DEFAULT_NOTIFICATION_SETTINGS.jobs,
        recommendationsEnabled: DEFAULT_NOTIFICATION_SETTINGS.recommendations,
      },
      update: {},
    });

    return this.toNotificationSettingsResponse(settings);
  }

  async updateNotificationSettings(
    userId: string,
    data: UpdateNotificationSettingsDTO
  ) {
    const settings = await this.prisma.notificationSettings.upsert({
      where: { userId },
      create: {
        userId,
        applicationsEnabled:
          data.applications ?? DEFAULT_NOTIFICATION_SETTINGS.applications,
        jobsEnabled: data.jobs ?? DEFAULT_NOTIFICATION_SETTINGS.jobs,
        recommendationsEnabled:
          data.recommendations ?? DEFAULT_NOTIFICATION_SETTINGS.recommendations,
      },
      update: {
        ...(data.applications !== undefined && {
          applicationsEnabled: data.applications,
        }),
        ...(data.jobs !== undefined && { jobsEnabled: data.jobs }),
        ...(data.recommendations !== undefined && {
          recommendationsEnabled: data.recommendations,
        }),
      },
    });

    return this.toNotificationSettingsResponse(settings);
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

  private createNotificationRecord(data: CreateNotificationDTO) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link,
        metadata: data.metadata,
      },
    });
  }

  private async shouldSendRealtimeNotification(
    userId: string,
    type: NotificationType
  ) {
    const preferenceKey = this.getPreferenceKeyForType(type);

    if (!preferenceKey) {
      return true;
    }

    const settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return true;
    }

    return this.isPreferenceEnabled(preferenceKey, settings);
  }

  private async getNotificationSettingsByUserId(data: CreateNotificationDTO[]) {
    const userIds = [
      ...new Set(
        data
          .filter((notification) =>
            Boolean(this.getPreferenceKeyForType(notification.type))
          )
          .map((notification) => notification.recipientId)
      ),
    ];

    if (userIds.length === 0) {
      return new Map<string, NotificationSettingsFlags>();
    }

    const settings = await this.prisma.notificationSettings.findMany({
      where: { userId: { in: userIds } },
    });

    return new Map(settings.map((setting) => [setting.userId, setting]));
  }

  private shouldSendRealtimeNotificationFromSettings(
    type: NotificationType,
    settings?: NotificationSettingsFlags
  ) {
    const preferenceKey = this.getPreferenceKeyForType(type);

    if (!preferenceKey || !settings) {
      return true;
    }

    return this.isPreferenceEnabled(preferenceKey, settings);
  }

  private isPreferenceEnabled(
    preferenceKey: NotificationPreferenceKey,
    settings: {
      applicationsEnabled: boolean;
      jobsEnabled: boolean;
      recommendationsEnabled: boolean;
    }
  ) {
    if (preferenceKey === 'applications') {
      return settings.applicationsEnabled;
    }

    if (preferenceKey === 'jobs') {
      return settings.jobsEnabled;
    }

    return settings.recommendationsEnabled;
  }

  private getPreferenceKeyForType(
    type: NotificationType
  ): NotificationPreferenceKey | null {
    if (APPLICATION_NOTIFICATION_TYPES.has(type)) {
      return 'applications';
    }

    if (JOB_NOTIFICATION_TYPES.has(type)) {
      return 'jobs';
    }

    if (RECOMMENDATION_NOTIFICATION_TYPES.has(type)) {
      return 'recommendations';
    }

    return null;
  }

  private toNotificationSettingsResponse(settings: {
    applicationsEnabled: boolean;
    jobsEnabled: boolean;
    recommendationsEnabled: boolean;
  }) {
    return {
      applications: settings.applicationsEnabled,
      jobs: settings.jobsEnabled,
      recommendations: settings.recommendationsEnabled,
    };
  }
}
