import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { auth } from '../lib/auth';
import { ApiKeyGuard } from '../app/mcp/auth/api-key.guard';
import { RequestWithMcpUser } from '../app/mcp/auth/api-key.types';

const createMockContext = (
  headers: Record<string, string>,
  mcpUserId?: string
) => {
  const request: RequestWithMcpUser = {
    headers,
    mcpUserId,
  } as RequestWithMcpUser;
  const setHeader = vi.fn();
  const response = { setHeader };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ExecutionContext;
  return { context, setHeader, request };
};

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let verifySpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new ApiKeyGuard();
    verifySpy = vi.spyOn(auth.api, 'verifyApiKey');
  });

  it('throws missing_api_key when Authorization header is missing', async () => {
    const { context, setHeader } = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'missing_api_key' })
    );

    expect(verifySpy).not.toHaveBeenCalled();
    expect(setHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      expect.stringContaining('Bearer')
    );
  });

  it('throws invalid_authorization_header when Authorization header is malformed', async () => {
    const { context, setHeader } = createMockContext({
      authorization: 'NotBearer token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'invalid_authorization_header' })
    );

    expect(verifySpy).not.toHaveBeenCalled();
    expect(setHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      expect.stringContaining('Bearer')
    );
  });

  it('throws invalid_api_key when verifyApiKey returns valid: false', async () => {
    verifySpy.mockResolvedValue({
      valid: false,
      error: { message: 'Invalid API key', code: 'KEY_NOT_FOUND' },
      key: null,
    } as never);

    const { context, setHeader } = createMockContext({
      authorization: 'Bearer invalid_key',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'invalid_api_key' })
    );

    expect(verifySpy).toHaveBeenCalledWith({ body: { key: 'invalid_key' } });
    expect(setHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      expect.stringContaining('Bearer')
    );
  });

  it('attaches mcpUserId to request when key is valid', async () => {
    verifySpy.mockResolvedValue({
      valid: true,
      error: null,
      key: {
        id: 'key-123',
        referenceId: 'user-123',
        name: 'Test Key',
        prefix: 'jobly_sk_',
        createdAt: new Date(),
        updatedAt: new Date(),
        configId: 'default',
        enabled: true,
        rateLimitEnabled: false,
        rateLimitTimeWindow: 86400000,
        rateLimitMax: 10,
        requestCount: 0,
        permissions: null,
        metadata: null,
      },
    } as never);

    const { context, setHeader } = createMockContext({
      authorization: 'Bearer valid_key',
    });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const req = context.switchToHttp().getRequest();
    expect(req.mcpUserId).toBe('user-123');
    expect(verifySpy).toHaveBeenCalledWith({ body: { key: 'valid_key' } });
    expect(setHeader).not.toHaveBeenCalled();
  });

  it('throws key_misconfigured when referenceId is missing on valid key', async () => {
    verifySpy.mockResolvedValue({
      valid: true,
      error: null,
      key: {
        id: 'key-123',
        referenceId: null,
        name: 'Test Key',
        prefix: 'jobly_sk_',
        createdAt: new Date(),
        updatedAt: new Date(),
        configId: 'default',
        enabled: true,
        rateLimitEnabled: false,
        rateLimitTimeWindow: 86400000,
        rateLimitMax: 10,
        requestCount: 0,
        permissions: null,
        metadata: null,
      },
    } as never);

    const { context } = createMockContext({
      authorization: 'Bearer valid_key',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new InternalServerErrorException({ error: 'key_misconfigured' })
    );
  });
});
