import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../app/auth/auth.service';

// hoisted mock user data
const mockUser = vi.hoisted(() => ({
  id: 'user123',
  email: 'example@mail.com',
  password: 'hashedpassword',
}));

// mock dependencies
vi.mock('../lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue(mockUser.id),
    },
  },
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
});