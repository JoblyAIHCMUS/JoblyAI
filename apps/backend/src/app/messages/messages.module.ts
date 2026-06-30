import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PresenceService } from './presence.service';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, PresenceService],
})
export class MessagesModule {}
