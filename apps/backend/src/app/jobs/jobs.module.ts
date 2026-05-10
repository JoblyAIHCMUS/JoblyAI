import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AuthModule } from '../auth/auth.module';
import { JobViewListener } from './listeners/job-view.listener';

@Module({
  imports: [AuthModule],
  controllers: [JobsController],
  providers: [JobsService, JobViewListener],
})
export class JobsModule {}
