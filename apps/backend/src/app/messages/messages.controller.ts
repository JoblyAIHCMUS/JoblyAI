import { Controller, Get, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChatStatusResponse } from './messages.interface';

@Controller('chats')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('summary')
  async getChatListSummary(
    @Query('userId') userId: string
  ): Promise<ChatStatusResponse[]> {
    return this.messagesService.getChatListSummary(userId);
  }
}
