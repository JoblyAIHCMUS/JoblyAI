import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from '../../../lib/auth';
import { RequestWithMcpUser } from './api-key.types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithMcpUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({ error: 'missing_api_key' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ error: 'invalid_authorization_header' });
    }

    const key = authHeader.slice(7);
    const result = await auth.api.verifyApiKey({ body: { key } });

    if (!result.valid) {
      throw new UnauthorizedException({ error: 'invalid_api_key' });
    }

    const userId = result.key?.referenceId;
    if (!userId) {
      throw new InternalServerErrorException({ error: 'key_misconfigured' });
    }

    request.mcpUserId = userId;
    return true;
  }
}
