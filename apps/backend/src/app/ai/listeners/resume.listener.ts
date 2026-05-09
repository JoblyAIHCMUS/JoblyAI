import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ProfileSyncService } from '../profile-sync.service';

@Injectable()
export class ResumeListener {
  private readonly logger = new Logger(ResumeListener.name);

  constructor(
    @InjectQueue('resume-extraction') private readonly extractionQueue: Queue,
    @InjectQueue('resume-scoring') private readonly scoringQueue: Queue,
    private readonly profileSyncService: ProfileSyncService,
  ) {}

  @OnEvent('resume.created')
  async handleResumeCreated(payload: { resumeId: number; candidateId: string }) {
    this.logger.log(`Resume created event received for ID: ${payload.resumeId}. Adding to queues...`);
    
    // Add to extraction queue
    await this.extractionQueue.add('extract', {
      resumeId: payload.resumeId,
      candidateId: payload.candidateId,
    });

    // Add to scoring queue (optional: could wait for extraction to finish first)
    await this.scoringQueue.add('score', {
      resumeId: payload.resumeId,
      candidateId: payload.candidateId,
    });
  }

  @OnEvent('resume.deleted')
  async handleResumeDeleted(payload: { resumeId: number; candidateId: string }) {
    this.logger.log(`Resume deleted event received for ID: ${payload.resumeId}. Cleaning up profile data...`);
    
    try {
      await this.profileSyncService.handleResumeDeletion(payload.candidateId, payload.resumeId);
      this.logger.log(`Successfully cleaned up profile data for deleted resume ${payload.resumeId}`);
    } catch (error: any) {
      this.logger.error(`Failed to cleanup profile data for deleted resume ${payload.resumeId}: ${error.message}`);
    }
  }
}
