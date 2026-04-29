import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AiGateway {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(AiGateway.name);

  notifyUser(userId: string, event: string, payload: any) {
    this.logger.log(`Emitting ${event} to user ${userId}`);
    this.server.emit(`${event}_${userId}`, payload);
  }
}
