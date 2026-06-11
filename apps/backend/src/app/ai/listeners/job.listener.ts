import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobListener {
  private readonly logger = new Logger(JobListener.name);

  constructor(@InjectQueue('job-embedding') private readonly jobQueue: Queue) {}

  @OnEvent('job.posting.updated')
  async handleJobUpdated(payload: { id: number; content: string }) {
    this.logger.log(
      `Job updated event received for ID: ${payload.id}. Adding to embedding queue...`
    );

    await this.jobQueue.add(
      'embed',
      {
        jobId: payload.id,
        content: payload.content,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );
  }
}
