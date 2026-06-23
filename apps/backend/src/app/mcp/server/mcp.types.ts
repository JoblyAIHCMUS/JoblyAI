import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface McpState {
  userId: string;
  prisma: PrismaClient;
  logger: Logger;
}
