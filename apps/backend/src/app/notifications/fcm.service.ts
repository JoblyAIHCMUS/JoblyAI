import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import {
  getMessaging,
  type Messaging,
  type MulticastMessage,
} from 'firebase-admin/messaging';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private messaging?: Messaging;

  async onModuleInit() {
    try {
      this.messaging = await this.createMessagingClient();
      this.logger.log('Firebase Cloud Messaging initialized');
    } catch (error) {
      this.logger.warn(
        `Firebase Cloud Messaging is disabled: ${(error as Error).message}`
      );
    }
  }

  async sendPushNotification(token: string, payload: PushPayload) {
    const result = await this.sendPushToDevices([token], payload);
    return result.invalidTokens.length === 0;
  }

  async sendPushToDevices(tokens: string[], payload: PushPayload) {
    const uniqueTokens = [...new Set(tokens)].filter(Boolean);
    if (!this.messaging || uniqueTokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [] as string[],
      };
    }

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    for (let index = 0; index < uniqueTokens.length; index += 500) {
      const tokensBatch = uniqueTokens.slice(index, index + 500);
      const message: MulticastMessage = {
        tokens: tokensBatch,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        android: {
          priority: 'high',
          notification: { channelId: 'default', sound: 'default' },
        },
      };

      try {
        const response = await this.messaging.sendEachForMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;
        response.responses.forEach((item, responseIndex) => {
          const code = item.error?.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(tokensBatch[responseIndex]);
          }
        });
      } catch (error) {
        failureCount += tokensBatch.length;
        this.logger.error(
          `Failed to send FCM batch: ${(error as Error).message}`
        );
      }
    }

    return { successCount, failureCount, invalidTokens };
  }

  private async createMessagingClient() {
    if (getApps().length > 0) {
      return getMessaging();
    }

    const credentials = await this.loadServiceAccount();
    const app = initializeApp({ credential: cert(credentials) });
    return getMessaging(app);
  }

  private async loadServiceAccount(): Promise<ServiceAccount> {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ) as ServiceAccount;
    }

    const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const candidatePaths = configuredPath
      ? [resolve(configuredPath)]
      : [
          resolve(process.cwd(), 'firebase/service-account.json'),
          resolve(process.cwd(), 'apps/backend/firebase/service-account.json'),
        ];

    let lastError: unknown;
    for (const filePath of candidatePaths) {
      try {
        return JSON.parse(await readFile(filePath, 'utf8')) as ServiceAccount;
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(
      `service-account.json was not found (${
        (lastError as Error)?.message ?? 'unknown error'
      })`
    );
  }
}
