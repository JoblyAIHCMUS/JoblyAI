import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateNotificationSettingsDTO } from './dto/update-notification-settings.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: 200, description: 'Return list of notifications' })
  async getNotifications(@Req() req: any) {
    // Assuming userId is attached to req by auth guard/middleware
    const userId = req.user.id;
    return this.notificationsService.getNotifications(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    return { count: await this.notificationsService.getUnreadCount(userId) };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings for current user' })
  async getNotificationSettings(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getNotificationSettings(userId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update notification settings for current user' })
  async updateNotificationSettings(
    @Req() req: any,
    @Body() body: UpdateNotificationSettingsDTO
  ) {
    const userId = req.user.id;
    return this.notificationsService.updateNotificationSettings(userId, body);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  async markAsRead(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific notification' })
  async deleteNotification(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = req.user.id;
    return this.notificationsService.deleteNotification(userId, id);
  }
}
