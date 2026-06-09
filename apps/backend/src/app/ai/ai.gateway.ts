import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { WsAllExceptionsFilter } from '../common/filter/ws-exceptions.filter';

@Injectable()
@UseFilters(WsAllExceptionsFilter)
@WebSocketGateway()
export class AiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(AiGateway.name);

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const headers = client.handshake.headers as
      | Headers
      | Record<string, string | string[]>;

    const session = await this.authService.validateToken(headers);

    if (session?.user?.id) {
      const userId = String(session.user.id);
      await client.join(userId);
      this.logger.log(
        `User ${userId} joined AI room (client ${client.id})`
      );
    } else {
      this.logger.warn(
        `Unauthenticated AI WS connection rejected (client ${client.id})`
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`AI client ${client.id} disconnected`);
  }

  notifyUser(userId: string, event: string, payload: unknown) {
    const eventName = `${event}_${userId}`;
    this.logger.debug(`Emitting event: ${eventName} to user ${userId}`);
    this.server.to(userId).emit(eventName, payload);
  }
}
