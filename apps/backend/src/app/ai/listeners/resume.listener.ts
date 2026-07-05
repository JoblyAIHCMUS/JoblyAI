import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProfileSyncService } from '../profile-sync.service';

@Injectable()
export class ResumeListener {
  private readonly logger = new Logger(ResumeListener.name);

  constructor(private readonly profileSyncService: ProfileSyncService) {}

  @OnEvent('resume.deleted')
  async handleResumeDeleted(payload: {
    resumeId: number;
    candidateId: string;
    shouldKeepData?: boolean;
  }) {
    this.logger.log(
      `Resume deleted event received for ID: ${payload.resumeId}. Cleaning up profile data...`
    );

    try {
      await this.profileSyncService.handleResumeDeletion(
        payload.candidateId,
        payload.resumeId,
        payload.shouldKeepData
      );
      this.logger.log(
        `Successfully cleaned up profile data for deleted resume ${payload.resumeId}`
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to cleanup profile data for deleted resume ${
          payload.resumeId
        }: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
