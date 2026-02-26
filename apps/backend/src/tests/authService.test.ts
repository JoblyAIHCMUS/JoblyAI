import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../app/auth/auth.service';

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

const redisMock = vi.hoisted(() => ({
  get: vi.fn().mockResolvedValue(null),
  setex: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
}));

// mock dependencies
vi.mock('../lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: mockUser.id,
        session: mockSession,
      }),
    },
  },
}));

vi.mock('../lib/db', () => ({
  redis: redisMock,
}));

// import the actual auth module for type reference
import { auth } from '../lib/auth';

// set of tests for AuthService
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    vi.clearAllMocks(); // Clear mock call history before each test
    redisMock.get.mockResolvedValue(null);
  });

  it('should get session from auth api', async () => {
    // Arrange
    const requestHeaders = {
      authorization: 'Bearer valid-token',
    };

    // Act
    const session = await service.getSession(requestHeaders);

    // Assert
    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: requestHeaders,
    });
    expect(session).toStrictEqual({
      user: mockUser.id,
      session: mockSession,
    });
  });

  it('should not cache when auth api returns null', async () => {
    const requestHeaders = {
      authorization: 'Bearer missing-session',
    };
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const session = await service.getSession(requestHeaders);

    expect(redisMock.setex).not.toHaveBeenCalled();
    expect(session).toBeNull();
  });

  it('should invalidate cached session', async () => {
    // Arrange
    const sessionToken = 'invalidate-token';

    // Act
    await service.invalidateSessionCache(sessionToken);

    // Assert
    expect(redisMock.del).toHaveBeenCalledWith(`session:${sessionToken}`);
  });

  it('should return auth instance', () => {
    const instance = service.getAuthInstance();

    expect(instance).toBe(auth);
  });

  it('should validate token and return user detail', async () => {
    // Arrange
    const requestHeaders = {
      authorization: 'Bearer valid-token',
    };

    // Act
    const userDetail = await service.validateToken(requestHeaders);

    // Assert
    expect(userDetail).toEqual({
      user: mockUser.id,
      session: mockSession,
    });
  });
});
