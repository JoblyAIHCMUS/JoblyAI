import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { SendMessageDTO } from './dto/sendMessageDTO';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { WsAllExceptionsFilter } from '../common/filter/ws-exceptions.filter';

@UseFilters(WsAllExceptionsFilter)
@WebSocketGateway()
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService
  ) {}

  async handleConnection(client: Socket) {
    const headers = { ...(client.handshake.headers as Record<string, string>) };
    // React Native clients send the session via socket `auth` instead of
    // the upgrade headers. Merge it so authService.validateToken can find it.
    // The Cookie header (if present) takes precedence — it's what browsers send.
    const authCookie = (client.handshake.auth as { cookie?: string } | undefined)?.cookie;
    if (authCookie && !headers.cookie) headers.cookie = authCookie;

    const session = await this.authService.validateToken(headers);

    if (session?.user?.id) {
      const userId = String(session.user.id);
      client.data.userId = userId;
      await client.join(userId);
      this.logger.log(`User ${userId} is now online and joined room ${userId}`);
    } else {
      this.logger.warn(
        `Unauthenticated WS connection rejected (client ${client.id})`
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.logger.log(`User ${userId} disconnected (client ${client.id})`);
    } else {
      this.logger.log(`Unauthenticated client ${client.id} disconnected`);
    }
  }

  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    })
  )
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDTO
  ): Promise<
    | { status: 'ok'; messageId: string; timestamp: string }
    | { status: 'error'; error: string }
  > {
    const senderId = client.data.userId as string;
    try {
      const { messageId, timestamp } = await this.messagesService.sendMessage(
        senderId,
        dto
      );
      const chatId = MessagesService.getChatId(senderId, dto.recipientId);
      const payload = { chatId, messageId, senderId, content: dto.text, timestamp };

      // Recipient (existing behavior)
      this.server.to(dto.recipientId).emit('new_message', payload);

      // Sender (NEW) — multi-device sync. Same payload; the client de-dupes
      // by messageId so a sender with the chat open on this device won't see
      // a duplicate of the optimistic message they just sent.
      this.server.to(senderId).emit('new_message', payload);

      return { status: 'ok', messageId, timestamp };
    } catch (e) {
      return { status: 'error', error: (e as Error).message };
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { friendId: string }
  ) {
    const userId = client.data.userId as string;
    await this.messagesService.markAsRead(userId, data.friendId);

    this.server.to(userId).emit('message_read', { friendId: data.friendId });
    this.server.to(data.friendId).emit('message_read', { by: userId });
  }
}
