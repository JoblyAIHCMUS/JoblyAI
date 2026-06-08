import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JobViewedEvent } from '../events/job-viewed.event';
import { JobViewBatcher } from './job-view-batcher';

@Injectable()
export class JobViewListener {
  constructor(private readonly batcher: JobViewBatcher) {}

  @OnEvent('job.viewed')
  handleJobViewedEvent(event: JobViewedEvent): void {
    this.batcher.add(event.jobId);
  }
}
