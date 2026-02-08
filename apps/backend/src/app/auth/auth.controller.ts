import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { auth } from '../../lib/auth';

@Controller('auth')
export class AuthController {
  /**
   * Handle all auth routes through better-auth
   * Better-auth provides: /sign-in, /sign-up, /sign-out, /session, etc.
   */
  @All('*')
  async handleAuth(@Req() req: ExpressRequest, @Res() res: Response) {
    const request = this.toWebRequest(req);
    const authRes = await auth.handler(request);

    res.status(authRes.status);
    authRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await authRes.text();
    return res.send(body);
  }

  private toWebRequest(req: ExpressRequest): Request {
    const baseUrl =
      process.env.BETTER_AUTH_URL || process.env.APP_URL || 'http://localhost:3000';
    const url = new URL(req.originalUrl || req.url, baseUrl);
    const headers = new Headers();

    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers.set(key, value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((entry) => headers.append(key, entry));
      }
    });

    let body: string | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body instanceof Buffer) {
        body = req.body.toString('utf-8');
      } else if (typeof req.body === 'string') {
        body = req.body;
      } else if (req.body) {
        body = JSON.stringify(req.body);
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
      }
    }

    return new Request(url, {
      method: req.method,
      headers,
      body,
    });
  }
}
