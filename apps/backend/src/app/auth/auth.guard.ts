import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LogtoDebugGuard extends AuthGuard('logto') {
  
  override canActivate(context: ExecutionContext) { 
    return super.canActivate(context);
  }

  override getAuthenticateOptions(_context: ExecutionContext) {
    void _context;
    return {
        response_mode: 'query',
    };
  }

  override handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    _context: ExecutionContext,
    _status?: unknown
  ): TUser {
    void _context;
    void _status;
    if (err || !user) {
      console.error('💥 LOGTO AUTH ERROR:', err);
      console.error('ℹ️ LOGTO INFO:', info);
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

@Injectable()
export class LogtoRegisterGuard extends LogtoDebugGuard {
  override getAuthenticateOptions(_context: ExecutionContext) {
    void _context;
    return {
        interaction_mode: 'signUp',
        response_mode: 'query',
    };
  }
}