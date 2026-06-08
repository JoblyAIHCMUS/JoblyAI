import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AuthModule } from '../auth/auth.module';
import { JobViewListener } from './listeners/job-view.listener';
import { JobViewBatcher } from './listeners/job-view-batcher';

@Module({
  imports: [AuthModule],
  controllers: [JobsController],
  providers: [JobsService, JobViewListener, JobViewBatcher],
})
export class JobsModule {}
