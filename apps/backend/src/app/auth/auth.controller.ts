import { Controller, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LogtoDebugGuard, LogtoRegisterGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Req() req: Request & { user?: any }) {
    if (!req.user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return req.user;
  }

  @Get('login')
  @UseGuards(LogtoDebugGuard)
  login() {
    return { ok: true };
  }

  @Get('callback/logto')
  @UseGuards(LogtoDebugGuard)
  async callback(
    @Req() req: Request & { user?: { id?: string } },
    @Res() res: Response
  ) {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Missing user id' });
    }
    // TODO: If you later need to call Logto APIs (e.g., manage users), store and refresh tokens here.
    // Redirect to frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/dashboard`);
  }

  @Get('register')
  @UseGuards(LogtoRegisterGuard)
  register() {
    return { ok: true };
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }

      req.session?.destroy((sessionErr) => {
        if (sessionErr) {
          console.error('Session destruction error:', sessionErr);
          return res.status(500).json({ message: 'Logout failed' });
        }

        const publicEndpoint =
          process.env.LOGTO_PUBLIC_ENDPOINT || process.env.LOGTO_ENDPOINT || '';
        const appUrl = process.env.APP_URL || 'http://localhost:3000';

        if (publicEndpoint) {
          const logtoLogoutUrl = new URL(`${publicEndpoint}/oidc/session/end`);
          logtoLogoutUrl.searchParams.append(
            'post_logout_redirect_uri',
            appUrl + '/api'
          );
          return res.redirect(logtoLogoutUrl.toString());
        }

        return res.redirect('/');
      });
    });
  }
}
