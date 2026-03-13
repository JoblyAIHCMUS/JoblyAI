import { Controller, Get, Query, Request, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChatStatusResponse } from './messages.interface';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';

@Controller('chats')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('summary')
  async getChatListSummary(
    @Query('userId') userId: string
  ): Promise<ChatStatusResponse[]> {
    return this.messagesService.getChatListSummary(userId);
  }

  @Get('history/:friendId')
  async getHistory(
    @Request() req: AuthenticatedRequest,
    @Param('friendId') friendId: string,
    @Query('limit') limit?: number
  ) {
    return await this.messagesService.getChatHistory(
      req.user.id,
      friendId,
      limit || 50
    );
  }

  @Post('read/:friendId')
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('friendId') friendId: string
  ) {
    return await this.messagesService.markAsRead(req.user.id, friendId);
  }

  @Post('init/:friendId')
  async initChat(
    @Request() req: AuthenticatedRequest,
    @Param('friendId') friendId: string
  ) {
    await this.messagesService.createConversation(req.user.id, friendId);
    return { success: true };
  }
}
