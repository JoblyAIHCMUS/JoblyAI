import {
  Controller,
  All,
  Req,
  Res,
  Get,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { auth } from '../../lib/auth';
import { AuthGuard } from './auth.guard';
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

  /**
   * Silent refresh endpoint for clients: proxy to Better Auth session endpoint
   * Client should call POST /auth/refresh to attempt to rotate/refresh session cookie
   */
  @Post('refresh')
  async refresh(@Req() req: ExpressRequest, @Res() res: Response) {
    const baseUrl =
      process.env.BETTER_AUTH_URL ||
      process.env.APP_URL ||
      'http://localhost:3000';

    // Build a Request to Better Auth's /session endpoint using the incoming headers (cookies)
    const url = new URL('/session', baseUrl);
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

    const request = new Request(url.toString(), {
      method: 'GET',
      headers,
    });

    const authRes = await auth.handler(request);

    res.status(authRes.status);
    authRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await authRes.text();
    return res.send(body);
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
    authRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

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
        }
      } catch {
        // If parsing fails, just send the original body
      }
    }

    // ✅ SET ROLE COOKIE for middleware access (sign-in & sign-up & google/github callback)
    // IMPORTANT: Append to existing Set-Cookie headers, don't replace!
    // NOTE: Google/GitHub OAuth responses will be handled by Better Auth callback
    const isAuthSuccess =
      (req.method === 'POST' &&
        (req.originalUrl || req.url).includes('/sign-up')) ||
      (req.method === 'POST' &&
        (req.originalUrl || req.url).includes('/sign-in') &&
        authRes.status === 200) ||
      (req.method === 'GET' &&
        (req.originalUrl || req.url).includes('/callback') &&
        authRes.status === 200);

    if (isAuthSuccess) {
      try {
        const jsonBody = JSON.parse(body);
        if (jsonBody.user?.role) {
          // CRITICAL: Use append() instead of setHeader() to avoid overwriting Better Auth cookies
          const roleCookieValue = `user-role=${
            jsonBody.user.role
          }; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
          res.appendHeader('Set-Cookie', roleCookieValue);
          console.log(
            `[AUTH] Set role cookie for user ${jsonBody.user.id}: ${jsonBody.user.role}`
          );
        }
      } catch (error) {
        // If parsing fails, just continue without setting role cookie
        console.warn(
          '[AUTH] Failed to parse auth response or set role cookie:',
          error
        );
      }
    }

    // ✅ CLEAR ROLE COOKIE on logout (sign-out)
    const isSignOut =
      (req.originalUrl || req.url).includes('/sign-out') &&
      authRes.status === 200;
    if (isSignOut) {
      // Clear the role cookie by setting it with max-age=0
      const clearRoleCookie = 'user-role=; Path=/; SameSite=Lax; Max-Age=0';
      res.appendHeader('Set-Cookie', clearRoleCookie);
      console.log('[AUTH] Cleared role cookie on sign-out');
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
