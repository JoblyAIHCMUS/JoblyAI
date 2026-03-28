import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { SendMessageDTO } from './dto/sendMessageDTO';
import { UsePipes, ValidationPipe } from '@nestjs/common';
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
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService
  ) {}

  async handleConnection(client: Socket) {
    const headers = client.handshake.headers as
      | Headers
      | Record<string, string | string[]>;

    const session = await this.authService.validateToken(headers);

    if (session?.user?.id) {
      const userId = String(session.user.id);
      client.data.userId = userId;
      await client.join(userId);
      console.log(`User ${userId} is now online and joined room ${userId}`);
    } else {
      console.log('Unauthenticated websocket connection rejected');
      client.disconnect();
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDTO
  ) {
    const senderId = client.data.userId as string;

    await this.messagesService.sendMessage(senderId, dto);

    // 2. Real-time Push: Emit only to the recipient's private room
    this.server.to(dto.recipientId).emit('new_message', {
      senderId,
      content: dto.text,
      timestamp: new Date(),
    });

    return { status: 'ok' };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { friendId: string }
  ) {
    const userId = client.data.userId as string;
    await this.messagesService.markAsRead(userId, data.friendId);

    // Notify the current user (sender) that the chat is now marked as read
    // This allows the sidebar to refresh and remove the notification dot
    this.server.to(userId).emit('message_read', { friendId: data.friendId });
    
    // Also notify the friend that the current user read the message
    this.server.to(data.friendId).emit('message_read', { by: userId });
  }
}
