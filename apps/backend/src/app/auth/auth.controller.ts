import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  //must inject the AuthService to use its methods
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('logto'))
  login(@Res() res: Response) {
    res.send('Logging in...');
  }

  @Get('callback')
  @UseGuards(AuthGuard('logto'))
  callback(@Res() res: Response) {
    res.redirect('/dashboard');
  }

  @Get('register')
  register(@Req() req: Response, @Res() res: Response) {
    const registerUrl = this.authService.getRegisterUrl();
    res.redirect(registerUrl);
  }
}