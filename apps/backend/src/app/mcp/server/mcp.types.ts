import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type McpRole = 'employer' | 'candidate';

export interface McpState {
  userId: string;
  role: McpRole;
  companyId: number | null;
  prisma: PrismaClient;
  logger: Logger;
}
