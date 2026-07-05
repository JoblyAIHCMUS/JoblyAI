import type { Logger } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import type { GcsService } from '../../gcs/gcs.service';
import type { ResumeParserService } from '../../ai/resume-parser.service';
import type { ProfileSyncService } from '../../ai/profile-sync.service';

export type McpRole = 'employer' | 'candidate';

export interface McpState {
  userId: string;
  role: McpRole;
  companyId: number | null;
  prisma: PrismaClient;
  logger: Logger;
  gcsService: GcsService;
  resumeParserService: ResumeParserService;
  profileSyncService: ProfileSyncService;
}
