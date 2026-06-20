import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../auth/auth.module';
import { DevicesController } from './devices.controller';
import { FcmService } from './fcm.service';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController, DevicesController],
  providers: [NotificationsService, NotificationsGateway, FcmService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
