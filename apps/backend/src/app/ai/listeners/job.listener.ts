import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectPrisma } from '../../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JobListener {
  private readonly logger = new Logger(JobListener.name);

  constructor(
    @InjectQueue('job-embedding') private readonly jobQueue: Queue,
    @InjectPrisma() private readonly prisma: PrismaClient
  ) {}

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

    // Clear existing match explanations for all applications of this job
    // They will be recalculated on next access
    try {
      const applications = await this.prisma.application.findMany({
        where: { jobId: payload.id },
        select: { id: true },
      });

      if (applications.length > 0) {
        this.logger.log(
          `Clearing match explanations for ${applications.length} applications of job ${payload.id}`
        );

        await this.prisma.application.updateMany({
          where: { jobId: payload.id },
          data: { matchExplanation: undefined },
        });

        this.logger.log(
          `Cleared match explanations for ${applications.length} applications of job ${payload.id}`
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to clear match explanations for job ${payload.id}: ${error.message}`
      );
    }
  }
}
