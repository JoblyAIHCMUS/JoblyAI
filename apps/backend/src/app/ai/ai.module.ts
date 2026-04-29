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

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'resume-extraction' },
      { name: 'resume-scoring' },
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
