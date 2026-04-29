import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiGateway } from './ai.gateway';
import { ResumeProcessor } from './processors/resume.processor';
import { ScoringProcessor } from './processors/scoring.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'resume-extraction' },
      { name: 'resume-scoring' },
    ),
  ],
  providers: [
    AiGateway,
    ResumeProcessor,
    ScoringProcessor,
    // Services will be added here in Stage 2 & 3
  ],
  exports: [AiGateway],
})
export class AiModule {}
