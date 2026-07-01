import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectPrisma } from '../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { UpdateNotificationSettingsDTO } from './dto/update-notification-settings.dto';
import { NotificationType } from './notification-type.enum';
import { FcmService, type PushPayload } from './fcm.service';
import type { RegisterDeviceDTO } from './dto/register-device.dto';

type NotificationPreferenceKey =
  | 'applications'
  | 'jobs'
  | 'recommendations'
  | 'messages';

const DEFAULT_NOTIFICATION_SETTINGS = {
  applications: true,
  jobs: true,
  recommendations: true,
  messages: true,
};

type NotificationSettingsFlags = {
  userId: string;
  applicationsEnabled: boolean;
  jobsEnabled: boolean;
  recommendationsEnabled: boolean;
  messageEnabled: boolean;
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
  NotificationType.INTERVIEW_PREPARATION_READY,
]);

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly fcmService: FcmService
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
      await this.sendPushToUser(
        data.recipientId,
        this.toPushPayload(data, notification.id)
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

    const pushTasks: Promise<unknown>[] = [];
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
        pushTasks.push(
          this.sendPushToUser(
            notificationData.recipientId,
            this.toPushPayload(notificationData, notification.id)
          )
        );
      }
    });

    await Promise.all(pushTasks);

    return notifications;
  }

  async registerDevice(userId: string, data: RegisterDeviceDTO) {
    return this.prisma.userDevice.upsert({
      where: { pushToken: data.pushToken },
      create: {
        userId,
        platform: data.platform,
        pushToken: data.pushToken,
      },
      update: {
        userId,
        platform: data.platform,
      },
      select: {
        id: true,
        platform: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async sendPushToUser(userId: string, payload: PushPayload) {
    try {
      const devices = await this.prisma.userDevice.findMany({
        where: { userId },
        select: { pushToken: true },
      });

      return await this.sendPushToDevices(
        devices.map((device) => device.pushToken),
        payload
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to user ${userId}: ${
          (error as Error).message
        }`
      );
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }
  }

  async sendPushToDevices(pushTokens: string[], payload: PushPayload) {
    const result = await this.fcmService.sendPushToDevices(pushTokens, payload);

    if (result.invalidTokens.length > 0) {
      await this.prisma.userDevice.deleteMany({
        where: { pushToken: { in: result.invalidTokens } },
      });
    }

    return result;
  }

  sendPushNotification(pushToken: string, payload: PushPayload) {
    return this.fcmService.sendPushNotification(pushToken, payload);
  }

  notifyInterviewPreparationReady(
    userId: string,
    metadata?: Record<string, unknown>,
    link?: string
  ) {
    return this.createNotification({
      recipientId: userId,
      type: NotificationType.INTERVIEW_PREPARATION_READY,
      title: 'Interview Preparation Ready',
      content: 'Your interview preparation report is ready.',
      link,
      metadata,
    });
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.prisma.notificationSettings.upsert({
      where: { userId },
      create: {
        userId,
        applicationsEnabled: DEFAULT_NOTIFICATION_SETTINGS.applications,
        jobsEnabled: DEFAULT_NOTIFICATION_SETTINGS.jobs,
        recommendationsEnabled: DEFAULT_NOTIFICATION_SETTINGS.recommendations,
        messageEnabled: DEFAULT_NOTIFICATION_SETTINGS.messages,
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
        messageEnabled: data.messages ?? DEFAULT_NOTIFICATION_SETTINGS.messages,
      },
      update: {
        ...(data.applications !== undefined && {
          applicationsEnabled: data.applications,
        }),
        ...(data.jobs !== undefined && { jobsEnabled: data.jobs }),
        ...(data.recommendations !== undefined && {
          recommendationsEnabled: data.recommendations,
        }),
        ...(data.messages !== undefined && {
          messageEnabled: data.messages,
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

  private toPushPayload(
    data: CreateNotificationDTO,
    notificationId: number
  ): PushPayload {
    return {
      title: data.title,
      body: data.content,
      data: {
        notificationId: String(notificationId),
        type: data.type,
        ...(data.link ? { link: data.link } : {}),
        ...(data.metadata ? { metadata: JSON.stringify(data.metadata) } : {}),
      },
    };
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
      messageEnabled: boolean;
    }
  ) {
    if (preferenceKey === 'applications') {
      return settings.applicationsEnabled;
    }

    if (preferenceKey === 'jobs') {
      return settings.jobsEnabled;
    }

    if (preferenceKey === 'messages') {
      return settings.messageEnabled;
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
    messageEnabled: boolean;
  }) {
    return {
      applications: settings.applicationsEnabled,
      jobs: settings.jobsEnabled,
      recommendations: settings.recommendationsEnabled,
      messages: settings.messageEnabled,
    };
  }
  private async getNotificationSettingsEntity(userId: string) {
    return this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
  }

  async sendPushOnly(recipientId: string, payload: PushPayload) {
    const settings = await this.getNotificationSettingsEntity(recipientId);

    if (settings && !settings.messageEnabled) {
      return;
    }

    await this.sendPushToUser(recipientId, payload);
  }
}
