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

  handleConnection(client: any) {
    this.logger.log(`Client connected to AI Gateway: ${client.id}`);
  }

  notifyUser(userId: string, event: string, payload: any) {
    const eventName = `${event}_${userId}`;
    this.logger.log(`Emitting event: ${eventName}`);
    this.server.emit(eventName, payload);
  }
}
