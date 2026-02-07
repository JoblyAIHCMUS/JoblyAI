import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from './auth/auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name?: string;
    emailVerified: boolean;
  };
  session: unknown;
}

@Controller('me')
export class UserController {
  @Get()
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return {
      user: req.user,
      session: req.session,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      emailVerified: req.user.emailVerified,
    };
  }
}
