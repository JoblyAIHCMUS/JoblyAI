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
    const response = context.switchToHttp().getResponse();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.setBearerChallenge(response);
      throw new UnauthorizedException({ error: 'missing_api_key' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.setBearerChallenge(response);
      throw new UnauthorizedException({
        error: 'invalid_authorization_header',
      });
    }

    const key = authHeader.slice(7);
    const result = await auth.api.verifyApiKey({ body: { key } });

    if (!result.valid) {
      this.setBearerChallenge(response);
      throw new UnauthorizedException({ error: 'invalid_api_key' });
    }

    const userId = result.key?.referenceId;
    if (!userId) {
      throw new InternalServerErrorException({ error: 'key_misconfigured' });
    }

    request.mcpUserId = userId;
    return true;
  }

  private setBearerChallenge(response: unknown): void {
    if (
      response &&
      typeof response === 'object' &&
      'setHeader' in response &&
      typeof (response as { setHeader: unknown }).setHeader === 'function'
    ) {
      (
        response as { setHeader: (name: string, value: string) => void }
      ).setHeader('WWW-Authenticate', 'Bearer realm="jobly-mcp"');
    }
  }
}
