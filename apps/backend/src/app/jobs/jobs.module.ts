import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AuthModule } from '../auth/auth.module';
import { JobViewListener } from './listeners/job-view.listener';
import { JobViewBatcher } from './listeners/job-view-batcher';
import { PreShortlistModule } from '../pre-shortlist/pre-shortlist.module';
import { AiModule } from '../ai/ai.module';
import { PreShortlistQuestionsController } from './pre-shortlist-questions.controller';

@Module({
  imports: [AuthModule, AiModule, PreShortlistModule],
  controllers: [JobsController, PreShortlistQuestionsController],
  providers: [JobsService, JobViewListener, JobViewBatcher],
})
export class JobsModule {}
