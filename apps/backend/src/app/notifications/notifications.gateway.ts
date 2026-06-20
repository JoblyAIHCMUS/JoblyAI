import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { WsAllExceptionsFilter } from '../common/filter/ws-exceptions.filter';

@UseFilters(WsAllExceptionsFilter)
@WebSocketGateway()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const headers = {
      ...(client.handshake.headers as Record<string, string>),
    };
    const authCookie = (
      client.handshake.auth as { cookie?: string } | undefined
    )?.cookie;
    if (authCookie && !headers.cookie) {
      headers.cookie = authCookie;
    }

    const session = await this.authService.validateToken(headers);

    if (session?.user?.id) {
      const userId = String(session.user.id);
      await client.join(`notifications:${userId}`);
      this.logger.log(
        `User ${userId} joined notification room (client ${client.id})`
      );
    } else {
      this.logger.warn(
        `Unauthenticated notification WS connection rejected (client ${client.id})`
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Notification client ${client.id} disconnected`);
  }

  sendNotification(userId: string, notification: unknown) {
    this.server
      .to(`notifications:${userId}`)
      .emit('new_notification', notification);
  }
}
