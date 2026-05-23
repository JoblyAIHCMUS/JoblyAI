import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiGateway } from './ai.gateway';
import { ResumeProcessor } from './processors/resume.processor';
import { ScoringProcessor } from './processors/scoring.processor';
import { AiProviderService } from './ai-provider.service';
import { ResumeParserService } from './resume-parser.service';
import { ResumeScoringService } from './resume-scoring.service';
import { AiController } from './ai.controller';
import { ProfileSyncService } from './profile-sync.service';
import { ResumeListener } from './listeners/resume.listener';
import { S3Module } from '../s3/s3.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    S3Module,
    AuthModule,
    BullModule.registerQueue(
      { name: 'resume-extraction' },
      { name: 'resume-scoring' }
    ),
  ],
  controllers: [AiController],
  providers: [
    AiGateway,
    ResumeProcessor,
    ScoringProcessor,
    AiProviderService,
    ResumeParserService,
    ResumeScoringService,
    ProfileSyncService,
    ResumeListener,
  ],
  exports: [
    AiGateway,
    AiProviderService,
    ResumeParserService,
    ResumeScoringService,
    ProfileSyncService,
  ],
})
export class AiModule {}
