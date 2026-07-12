import {
  Controller,
  All,
  Req,
  Res,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { auth } from '../../lib/auth';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Roles } from '../decorators/roles.decorator';
import { RoleGuard } from './role.guard';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { prisma } from '../../lib/db';
import {
  validatePassword,
  PASSWORD_REQUIREMENTS_TEXT,
} from '../../lib/password-validation';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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
      avatar: req.user.avatarUrl,
    };
  }

  @Get('admin-only-check')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin')
  adminOnlyRoute() {
    return { message: 'This is an admin only route' };
  }

  /**
   * Handle all auth routes through better-auth
   * Better-auth provides: /sign-in, /sign-up, /sign-out, /session, etc.
   */
  @All('*')
  async handleAuth(@Req() req: ExpressRequest, @Res() res: Response) {
    // Intercept signup role and name fields
    const path = req.originalUrl || req.url || '';
    if (req.method === 'POST' && path.includes('/sign-up')) {
      const body = req.body as Record<string, unknown>;

      // Validate password meets complexity requirements
      const password = body?.password;
      if (typeof password !== 'string' || !validatePassword(password)) {
        return res.status(400).json({
          error: 'Invalid password',
          message: PASSWORD_REQUIREMENTS_TEXT,
        });
      }

      if (body?.role) {
        const requestedRole = body.role;
        // VALIDATION: Reject invalid roles instead of silently ignoring them
        if (
          typeof requestedRole !== 'string' ||
          !['candidate', 'employer'].includes(requestedRole)
        ) {
          throw new BadRequestException(
            `Invalid role: "${requestedRole}". Allowed roles are: candidate, employer`
          );
        }
        (req as ExpressRequest & { targetRole?: string }).targetRole =
          requestedRole;
        delete body.role;
      }
      // Store firstName and lastName for later use
      if (body?.firstName || body?.lastName) {
        (
          req as ExpressRequest & { userDetails?: Record<string, string> }
        ).userDetails = {
          firstName: (body.firstName as string) || '',
          lastName: (body.lastName as string) || '',
        };
        delete body.firstName;
        delete body.lastName;
      }
    }

    const request = this.toWebRequest(req);
    const authRes = await auth.handler(request);

    res.status(authRes.status);

    // CRITICAL: Handle Set-Cookie headers correctly from Better Auth
    // Use forEach to get all headers, but handle Set-Cookie separately to avoid overwriting or incorrect concatenation
    authRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        // We'll handle Set-Cookie after this loop using getSetCookie() for maximum reliability
        return;
      }
      res.setHeader(key, value);
    });

    // Manually handle all Set-Cookie headers properly to avoid them being merged into a single header
    // getSetCookie() is available in Node 18+ and returns an array of individual cookie strings
    if (typeof authRes.headers.getSetCookie === 'function') {
      const betterAuthCookies = authRes.headers.getSetCookie();
      if (betterAuthCookies && betterAuthCookies.length > 0) {
        betterAuthCookies.forEach((cookie) => {
          res.appendHeader('Set-Cookie', cookie);
        });
      }
    } else {
      // Fallback for older Node versions if necessary
      const cookie = authRes.headers.get('set-cookie');
      if (cookie) res.setHeader('Set-Cookie', cookie);
    }

    let body = await authRes.text();

    // If this was a signup and we have a target role or user details, modify the response body
    const targetRole = (req as ExpressRequest & { targetRole?: string })
      .targetRole;
    const userDetails = (
      req as ExpressRequest & { userDetails?: Record<string, string> }
    ).userDetails;
    if (
      (targetRole || userDetails) &&
      req.method === 'POST' &&
      (req.originalUrl || req.url).includes('/sign-up')
    ) {
      try {
        const jsonBody = JSON.parse(body);
        if (jsonBody.user?.id) {
          if (targetRole) {
            jsonBody.user.role = targetRole;
          }
          if (userDetails) {
            jsonBody.user.firstName = userDetails.firstName;
            jsonBody.user.lastName = userDetails.lastName;
          }
          body = JSON.stringify(jsonBody);

          // Update the database with the role and name fields
          const updateData: Record<string, unknown> = {};
          if (targetRole) {
            updateData.role = targetRole;
          }
          if (userDetails) {
            updateData.firstName = userDetails.firstName;
            updateData.lastName = userDetails.lastName;
          }

          await prisma.user.update({
            where: { id: jsonBody.user.id },
            data: updateData,
          });

          // better-auth cached the session in Redis before we wrote role/name,
          // so refresh the cache to avoid a stale `user` on the next getSession.
          try {
            await this.authService.refreshUserSessionCache({
              id: jsonBody.user.id,
              ...updateData,
            });
          } catch (cacheErr) {
            console.error(
              '[AUTH] Failed to refresh session cache after user update',
              cacheErr
            );
          }
        }
      } catch {
        // If parsing fails, just send the original body
      }
    }

    // ✅ CLEAR SESSION COOKIES on logout (sign-out)
    const isSignOut =
      (req.originalUrl || req.url || '').includes('/sign-out') &&
      authRes.status === 200;
    if (isSignOut) {
      // REDUNDANT CLEAR: Ensure session cookies are cleared even if proxying logic had issues
      res.appendHeader(
        'Set-Cookie',
        'better-auth.session_token=; Path=/; SameSite=Lax; Max-Age=0; HttpOnly'
      );
      res.appendHeader(
        'Set-Cookie',
        '__Secure-better-auth.session_token=; Path=/; SameSite=Lax; Max-Age=0; HttpOnly; Secure'
      );

      console.log('[AUTH] Cleared session cookies on sign-out');
    }

    return res.send(body);
  }

  private toWebRequest(req: ExpressRequest): Request {
    const baseUrl =
      process.env.BETTER_AUTH_URL ||
      process.env.APP_URL ||
      'http://localhost:3000';
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

    // Ensure Origin header is set for Better Auth
    if (!headers.has('origin')) {
      headers.set('origin', new URL(baseUrl).origin);
    }

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
