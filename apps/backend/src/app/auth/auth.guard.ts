import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract token from cookie or Authorization header
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Get session from cache or database
      const session = await this.authService.getSession(token);
      
      if (!session || !session.user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Attach user to request
      request.user = session.user;
      request.session = session.session;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractToken(request: any): string | null {
    // Check Authorization header first
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check for cookie
    const cookies = request.headers.cookie;
    if (cookies) {
      const match = cookies.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}