import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiGateway } from '../ai.gateway';

@Processor('resume-scoring')
export class ScoringProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoringProcessor.name);

  constructor(private readonly aiGateway: AiGateway) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { resumeId, candidateId } = job.data;
    this.logger.log(`Processing resume scoring for ID: ${resumeId}`);

    // TODO: Actual scoring logic (Stage 2)

    // Emit notification
    this.aiGateway.notifyUser(candidateId, 'RESUME_SCORED', { resumeId });

    return { success: true, resumeId };
  }
}
