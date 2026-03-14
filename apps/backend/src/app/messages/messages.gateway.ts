import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { MessagesService } from './messages.service';
import { SendMessageDTO } from './dto/sendMessageDTO';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway implements OnGatewayConnection {
    @WebSocketServer() server!: Server;

    constructor(private readonly messagesService: MessagesService) {}

    async handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;

        if (userId) {
            await client.join(userId);
            console.log(`User ${userId} is now online and joined room ${userId}`);
        }
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: SendMessageDTO
    ) {
        const senderId = client.handshake.query.userId as string;

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
        const userId = client.handshake.query.userId as string;
        await this.messagesService.markAsRead(userId, data.friendId);
        
        // Notify the friend that Alice read the message
        this.server.to(data.friendId).emit('message_read', { by: userId });
    }
}