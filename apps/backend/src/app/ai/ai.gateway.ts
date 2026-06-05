import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
    allowEIO3: true,
  },
})
export class AiGateway implements OnGatewayConnection {
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
      this.logger.log(`User ${userId} joined AI room ${userId}`);
    } else {
      this.logger.warn(
        `Unauthenticated client ${client.id} rejected by AI Gateway`
      );
      // Optional: client.disconnect();
      // We don't necessarily want to disconnect here if they are connected for other things
    }
  }

  notifyUser(userId: string, event: string, payload: any) {
    const eventName = `${event}_${userId}`;
    this.logger.log(`Emitting event: ${eventName} to user ${userId}`);

    // We emit to the specific user's room for security and efficiency
    // We keep the dynamic event name for backward compatibility with frontend,
    // but target the specific user's room.
    this.server.to(userId).emit(eventName, payload);
  }
}
