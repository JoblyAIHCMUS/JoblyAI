import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiGateway } from './ai.gateway';
import { ResumeProcessor } from './processors/resume.processor';
import { ScoringProcessor } from './processors/scoring.processor';
import { AiProviderService } from './ai-provider.service';
import { ResumeParserService } from './resume-parser.service';
import { ResumeScoringService } from './resume-scoring.service';
import { AiController } from './ai.controller';
import { MatchingController } from './matching.controller';
import { ProfileSyncService } from './profile-sync.service';
import { MatchingService } from './matching.service';
import { ResumeListener } from './listeners/resume.listener';
import { S3Module } from '../s3/s3.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { JobProcessor } from './processors/job.processor';
import { JobListener } from './listeners/job.listener';

@Module({
  imports: [
    S3Module,
    AuthModule,
    NotificationsModule,
    BullModule.registerQueue(
      { name: 'resume-extraction' },
      { name: 'resume-scoring' },
      { name: 'job-embedding' }
    ),
  ],
  controllers: [AiController, MatchingController],
  providers: [
    AiGateway,
    ResumeProcessor,
    ScoringProcessor,
    JobProcessor,
    AiProviderService,
    ResumeParserService,
    ResumeScoringService,
    ProfileSyncService,
    MatchingService,
    ResumeListener,
    JobListener,
  ],
  exports: [
    AiGateway,
    AiProviderService,
    ResumeParserService,
    ResumeScoringService,
    ProfileSyncService,
    MatchingService,
  ],
})
export class AiModule {}
