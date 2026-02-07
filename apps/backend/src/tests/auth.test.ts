import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../app/auth/auth.service';

// hoisted mock user data
const mockUser = vi.hoisted(() => ({
  id: 'user123',
  email: 'example@mail.com',
  password: 'hashedpassword',
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
      getSession: vi.fn().mockResolvedValue(mockUser.id),
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

  // test get session
  it('should get session from auth api', async () => {
    // Arrange
    const sessionToken = 'valid-token';

    // Act
    const session = await service.getSession(sessionToken);
    
    // Assert
    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });
    expect(session).toBe(mockUser.id);  
  });

  it('should return cached session without calling auth api', async () => {
    // Arrange
    const sessionToken = 'cached-token';
    const cachedSession = { id: mockUser.id, email: mockUser.email };
    redisMock.get.mockResolvedValueOnce(JSON.stringify(cachedSession));

    // Act
    const session = await service.getSession(sessionToken);

    // Assert
    expect(redisMock.get).toHaveBeenCalledWith(`session:${sessionToken}`);
    expect(auth.api.getSession).not.toHaveBeenCalled();
    expect(session).toEqual(cachedSession);
  });

  it('should cache session after fetching from auth api', async () => {
    // Arrange
    const sessionToken = 'fresh-token';

    // Act
    const session = await service.getSession(sessionToken);

    // Assert
    expect(redisMock.setex).toHaveBeenCalledWith(
      `session:${sessionToken}`,
      300,
      JSON.stringify(mockUser.id)
    );
    expect(session).toBe(mockUser.id);
  });

  it('should not cache when auth api returns null', async () => {
    const sessionToken = 'missing-session';
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const session = await service.getSession(sessionToken);

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
});