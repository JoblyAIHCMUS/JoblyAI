import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

interface UserDetail {
  user: object;
  session: object;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async getSessionHeaders(
    context: ExecutionContext
  ): Promise<Record<string, string>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const cookieHeader = request.headers['cookie'];
    const headers: Record<string, string> = {};

    if (typeof authHeader === 'string' && authHeader.length > 0) {
      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid authorization header format');
      }
      headers.authorization = authHeader;
    }

    if (typeof cookieHeader === 'string' && cookieHeader.length > 0) {
      headers.cookie = cookieHeader;
    }

    if (!headers.authorization && !headers.cookie) {
      throw new UnauthorizedException(
        'Authorization header or session cookie missing'
      );
      throw new UnauthorizedException(
        'Authorization header or session cookie missing'
      );
    }

    return headers;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const sessionHeaders = await this.getSessionHeaders(context);
    const userDetail: UserDetail | null = (await this.authService.validateToken(
      sessionHeaders
    )) as UserDetail | null;
    const userDetail: UserDetail | null = (await this.authService.validateToken(
      sessionHeaders
    )) as UserDetail | null;
    if (!userDetail) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const request = context.switchToHttp().getRequest();
    request.user = userDetail.user;
    request.session = userDetail.session;
    return true;
  }
}
