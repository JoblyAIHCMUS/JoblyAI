import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

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
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const headers = client.handshake.headers as
      | Headers
      | Record<string, string | string[]>;

    const session = await this.authService.validateToken(headers);

    if (session?.user?.id) {
      const userId = String(session.user.id);
      await client.join(`notifications:${userId}`);
      console.log(`User ${userId} joined notification room`);
    } else {
      client.disconnect();
    }
  }

  sendNotification(userId: string, notification: any) {
    this.server
      .to(`notifications:${userId}`)
      .emit('new_notification', notification);
  }
}
