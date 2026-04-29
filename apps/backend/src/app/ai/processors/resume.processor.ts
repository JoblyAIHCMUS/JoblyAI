import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiGateway } from '../ai.gateway';

@Processor('resume-extraction')
export class ResumeProcessor extends WorkerHost {
  private readonly logger = new Logger(ResumeProcessor.name);

  constructor(private readonly aiGateway: AiGateway) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { resumeId, candidateId } = job.data;
    this.logger.log(`Processing resume extraction for ID: ${resumeId}`);

    // TODO: Actual parsing logic (Stage 2)
    
    // Emit notification
    this.aiGateway.notifyUser(candidateId, 'RESUME_PARSED', { resumeId });

    return { success: true, resumeId };
  }
}
