import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { RegisterDeviceDTO } from './dto/register-device.dto';
import { UnregisterDeviceDTO } from './dto/unregister-device.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('devices')
@Controller('devices')
@UseGuards(AuthGuard)
export class DevicesController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a mobile device push token' })
  registerDevice(
    @Req() request: AuthenticatedRequest,
    @Body() data: RegisterDeviceDTO
  ) {
    return this.notificationsService.registerDevice(request.user.id, data);
  }

  @Delete('current')
  @ApiOperation({ summary: 'Unregister the current mobile device push token' })
  unregisterDevice(
    @Req() request: AuthenticatedRequest,
    @Body() data: UnregisterDeviceDTO
  ) {
    return this.notificationsService.unregisterDevice(
      request.user.id,
      data.pushToken
    );
  }
}
