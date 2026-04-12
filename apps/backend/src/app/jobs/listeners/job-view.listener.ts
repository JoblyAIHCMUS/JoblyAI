import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';
import { JobViewedEvent } from '../events/job-viewed.event';
import { InjectPrisma } from '../../decorators/inject.decorator';

@Injectable()
export class JobViewListener {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

  @OnEvent('job.viewed')
  async handleJobViewedEvent(event: JobViewedEvent): Promise<void> {
    try {
      await this.prisma.jobView.create({
        data: {
          jobId: event.jobId,
        },
      });
    } catch (error) {
      // Silently fail if view tracking fails - don't break the main flow
      console.error(`Failed to track view for job ${event.jobId}:`, error);
    }
  }
}
