import { Controller, All, Req, Res, Get, UseGuards, BadRequestException } from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { auth } from '../../lib/auth';
import { AuthGuard } from './auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RoleGuard } from './role.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    emailVerified: boolean;
    image?: string;
  };
  session: unknown;
}

@Controller('auth')
export class AuthController {
  /**
   * Get current authenticated user
   */
  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      emailVerified: req.user.emailVerified,
      avatar: req.user.image,
    };
  }

  @Get('admin-only-check')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin')
  adminOnlyRoute() {
    return { message: 'This is an admin only route' };
  }

  @Get('employer-and-admin-check')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  employerAndAdminRoute() {
    return { message: 'This route is for employer and admins' };
  }

  /**
   * Handle all auth routes through better-auth
   * Better-auth provides: /sign-in, /sign-up, /sign-out, /session, etc.
   */
  @All('*')
  async handleAuth(@Req() req: ExpressRequest, @Res() res: Response) {
    this.enforceSignupRole(req);
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

  private enforceSignupRole(req: ExpressRequest) {
    const path = req.originalUrl || req.url || '';
    if (req.method !== 'POST' || !path.includes('/sign-up')) {
      return;
    }

    const role =
      req.body && typeof req.body === 'object' ? (req.body as { role?: unknown }).role : undefined;

    if (role === undefined || role === null) {
      return;
    }

    if (typeof role !== 'string') {
      throw new BadRequestException('Role must be a string');
    }

    if (role !== 'candidate' && role !== 'employer') {
      throw new BadRequestException('Role must be candidate or employer');
    }
  }
}
