import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  //Reflector is used to get metadata set by decorators such as when using @Roles("admin") it gets the "admin" part
  constructor(private readonly reflector: Reflector) {}

  // Execution Context provides details about the current request being processed such as request, response, handler, class, etc.
  canActivate(context: ExecutionContext): boolean {
    // Get the roles required for the route from metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // allow true if no roles are required
    }
    const { user } = context.switchToHttp().getRequest(); // Get user from request
    if (!user?.role)
      throw new Error(
        'User not found in request. Make sure you are using the AuthGuard.'
      );
    return requiredRoles.includes(user.role); // Check if user has any of the required roles
  }
}
