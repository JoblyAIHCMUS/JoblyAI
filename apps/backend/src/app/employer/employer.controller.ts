import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EmployerService } from './employer.service';
import { Roles } from '../decorators/roles.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { User } from '@prisma/client';
import { UpdateEmployerDto } from './dto/employer.dto';
import { UpdateAvatarDto } from './dto/avatar.dto';

export interface AuthRequest extends Request {
  user: User;
}

@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Get('/me')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer')
  async getEmployer(@Request() req: AuthRequest) {
    const user = req.user;

    return this.employerService.getProfileDetails(user.id);
  }

  @Post('/me')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer')
  async updateEmployer(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateEmployerDto
  ) {
    const user = req.user;

    if (!updateDto || Object.keys(updateDto).length === 0) {
      throw new BadRequestException('No data provided to update');
    }

    return this.employerService.updateProfile(user.id, updateDto);
  }

  /**
   * UPDATE AVATAR
   *
   * PATCH /api/employer/me/avatar
   *
   * Body: {
   *   fileKey: "assets/avatars/uuid.jpg",
   *   fileUrl: "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/avatars/uuid.jpg"
   * }
   *
   * Notes:
   * - Avatar is PUBLIC (stored in S3 bucket with public read access)
   * - Deletes old avatar from S3 if one exists
   * - Updates user's avatarUrl in database
   *
   * Response: {
   *   id: "user-id",
   *   avatarUrl: "https://...",
   *   ...other user fields
   * }
   */
  @Patch('/me/avatar')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer')
  async updateAvatar(
    @Request() req: AuthRequest,
    @Body() updateDto: UpdateAvatarDto
  ) {
    const { id: userId } = req.user;
    return await this.employerService.updateAvatar(userId, updateDto);
  }
}
