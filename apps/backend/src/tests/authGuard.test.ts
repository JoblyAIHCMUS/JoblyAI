import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from '../app/auth/auth.guard';
import { ExecutionContext } from '@nestjs/common';

// mock dependencies
vi.mock('../app/auth/auth.service', () => ({
  AuthService: vi.fn().mockImplementation(() => ({
    validateToken: vi.fn(),
  })),
}));

vi.mock('../lib/db', () => ({
  redis: vi.fn(),
}));

// hoisted mock user data
const mockUser = vi.hoisted(() => ({
  id: 'user123',
  email: 'example@mail.com',
  password: 'hashedpassword',
  role: 'candidate',
}));

const mockSession = vi.hoisted(() => ({
  id: 'session123',
  expiresAt: '2026-12-31T23:59:59.000Z',
}));

const authServiceMock = vi.hoisted(() => ({
  validateToken: vi.fn(),
}));

const createMockContext = (headers: Record<string, string>) => {
  const request = {
    headers,
    user: null,
    session: null,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
};

describe('AuthGuard', () => {
  const guard = new AuthGuard(authServiceMock as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should active and attach user and session to request', async () => {
    // Arrange
    const headers = {
      authorization: 'Bearer valid_token',
      cookie: 'better-auth.session-token=valid_token',
    };
    const context = createMockContext(headers);

    authServiceMock.validateToken.mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    // Act
    const result = await guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
    expect(authServiceMock.validateToken).toHaveBeenCalledWith(headers);
    const req = context.switchToHttp().getRequest();
    expect(req).toHaveProperty('user', mockUser);
    expect(req).toHaveProperty('session', mockSession);
  });

  it('should validate using cookie when authorization header is missing', async () => {
    // Arrange
    const headers = { cookie: 'better-auth.session-token=valid_token' };
    const context = createMockContext(headers);

    authServiceMock.validateToken.mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    // Act
    const result = await guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
    expect(authServiceMock.validateToken).toHaveBeenCalledWith({
      cookie: headers.cookie,
    });

    const req = context.switchToHttp().getRequest();
    expect(req.user).toEqual(mockUser);
    expect(req.session).toEqual(mockSession);
  });

  it('should return false when token is invalid', async () => {
    // Arrange
    const headers = {
      authorization: 'Bearer invalid_token',
      cookie: 'better-auth.session-token=invalid_token',
    };
    const context = createMockContext(headers);
    authServiceMock.validateToken.mockResolvedValue(null);

    // Act & Assert
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Invalid or expired token'
    );
    expect(authServiceMock.validateToken).toHaveBeenCalledWith(headers);
    const req = context.switchToHttp().getRequest();
    expect(req.user).toBeNull();
    expect(req.session).toBeNull();
  });

  it('should return false when token is missing', async () => {
    const headers = {};
    const context = createMockContext(headers);
    authServiceMock.validateToken.mockResolvedValue(null);

    // Act & Assert
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Authorization header or session cookie missing'
    );
    expect(authServiceMock.validateToken).not.toHaveBeenCalled();
    const req = context.switchToHttp().getRequest();
    expect(req.user).toBeNull();
    expect(req.session).toBeNull();
  });

  it('should return false when authorization header is missing Bearer', async () => {
    // Arrange
    const headers = { authorization: 'valid_token' };
    const context = createMockContext(headers);
    authServiceMock.validateToken.mockResolvedValue(mockUser);

    // Act & Assert
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Invalid authorization header format'
    );
    expect(authServiceMock.validateToken).not.toHaveBeenCalled();

    const req = context.switchToHttp().getRequest();
    expect(req.user).toBeNull();
    expect(req.session).toBeNull();
  });
});
