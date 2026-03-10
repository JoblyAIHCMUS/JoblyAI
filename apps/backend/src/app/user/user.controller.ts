import { Body, Controller, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '@prisma/client';
import { UpdateUserDTO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMyProfile(
    @Request() req: { user: User },
    @Body() updateDto: UpdateUserDTO
  ) {
    const userId = req.user.id;
    return await this.userService.updateUserProfile(userId, updateDto);
  }
}
