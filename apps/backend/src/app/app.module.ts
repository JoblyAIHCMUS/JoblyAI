import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
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
import { GcsModule } from './gcs/gcs.module';
import { MessagesModule } from './messages/messages.module';
import { CompanyModule } from './company/company.module';
import { SkillsModule } from './skills/skills.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { McpModule } from './mcp/mcp.module';
import { PreShortlistModule } from './pre-shortlist/pre-shortlist.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),
    DatabaseModule,
    AuthModule,
    JobsModule,
    ApplicationsModule,
    CandidatesModule,
    EmployerModule,
    UserModule,
    S3Module,
    GcsModule,
    MessagesModule,
    NotificationsModule,
    PreShortlistModule,
    CompanyModule,
    SkillsModule,
    AiModule,
    McpModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
