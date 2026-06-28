import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { EmployersApplicationsController } from './employers-applications.controller';
import { PreShortlistAnswersController } from './pre-shortlist-answers.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';
import { PreShortlistModule } from '../pre-shortlist/pre-shortlist.module';

@Module({
  imports: [AuthModule, NotificationsModule, AiModule, PreShortlistModule],
  controllers: [
    ApplicationsController,
    EmployersApplicationsController,
    PreShortlistAnswersController,
  ],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
