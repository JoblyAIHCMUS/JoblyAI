import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
}
