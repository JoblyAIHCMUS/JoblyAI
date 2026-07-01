import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';
import { MatchExplanationService } from '../../ai/match-explanation.service';
import { NotificationsService } from '../../notifications/notifications.service';

export type McpRole = 'employer' | 'candidate';

export interface McpState {
  userId: string;
  role: McpRole;
  companyId: number | null;
  prisma: PrismaClient;
  logger: Logger;
  matchExplanationService: MatchExplanationService;
  eventEmitter: EventEmitter2;
  notificationsService: NotificationsService;
}
