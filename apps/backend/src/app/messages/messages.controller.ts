import { Controller, Get, Query, Request, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChatSummaryResponse } from './messages.interface';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { AuthGuard } from '../auth/auth.guard';

@Controller('chats')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('summary')
  @UseGuards(AuthGuard)
  async getChatListSummary(
    @Query('userId') userId: string
  ): Promise<ChatSummaryResponse[]> {
    try {
      console.log('📨 getChatListSummary called with userId:', userId);
      const result = await this.messagesService.getChatListSummary(userId);
      console.log('✅ getChatListSummary success, returning:', result);
      return result;
    } catch (error) {
      console.error('❌ getChatListSummary ERROR:', error);
      throw error;
    }
  }

  @Get('history/:friendId')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('friendId') friendId: string
  ) {
    return await this.messagesService.markAsRead(req.user.id, friendId);
  }

  @Post('init/:friendId')
  @UseGuards(AuthGuard)
  async initChat(
    @Request() req: AuthenticatedRequest,
    @Param('friendId') friendId: string
  ) {
    await this.messagesService.createConversation(req.user.id, friendId);
    return { success: true };
  }
}
