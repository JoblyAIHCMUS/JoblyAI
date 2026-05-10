import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { CandidatesModule } from './candidates/candidates.module';
import { DatabaseModule } from './utils/databases';
import { UserModule } from './user/user.module';
import { EmployerModule } from './employer/employer.module';
import { S3Module } from './s3/s3.module';
import { MessagesModule } from './messages/messages.module';
import { CompanyModule } from './company/company.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    JobsModule,
    ApplicationsModule,
    CandidatesModule,
    EmployerModule,
    UserModule,
    S3Module,
    MessagesModule,
    CompanyModule,
    SkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
