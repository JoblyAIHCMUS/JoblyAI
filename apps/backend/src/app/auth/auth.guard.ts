import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from './auth.js';
import { fromNodeHeaders } from 'better-auth/node';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    /**
     * 1. Retrieve the Session
     * We pass the headers (which contain the cookie) to Better Auth, and the cookie has the session token.
     * Better Auth checks Redis to see if the session token is valid.
     */
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    // 2. The Gatekeeper Logic
    if (!session) {
      throw new UnauthorizedException('Access Denied: Please log in.');
    }

    // 3. Attach User to Request
    // This makes req.user available in Controllers
    request['user'] = session.user;
    request['session'] = session.session;

    return true;
  }
}