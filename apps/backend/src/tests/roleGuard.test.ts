import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleGuard } from '../app/auth/role.guard';
import { ExecutionContext } from '@nestjs/common';

// Mock dependencies
const reflectorMock = {
  getAllAndOverride: vi.fn(),
};

const createMockContext = (userRole?: string) => {
  const request = {
    user: { role: userRole },
  };
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

// Test suite
describe('RoleGuard', () => {
  const guard = new RoleGuard(reflectorMock as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow access if no roles are required', () => {
    // Arrange
    const context = createMockContext('admin');
    reflectorMock.getAllAndOverride.mockReturnValue(undefined); // No roles required

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should allow access if user has required role', () => {
    // Arrange
    const context = createMockContext('admin');
    context.switchToHttp().getRequest().user = { role: 'admin' };
    reflectorMock.getAllAndOverride.mockReturnValue(['admin']);

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });

  it('should reject access if user not have required role', () => {
    // Arrange
    const context = createMockContext('user');
    context.switchToHttp().getRequest().user = { role: 'user' };
    reflectorMock.getAllAndOverride.mockReturnValue(['admin']);

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(false);
  });

  it('should allow access if user has one of several required roles', () => {
    // Arrange
    const context = createMockContext('employer');
    reflectorMock.getAllAndOverride.mockReturnValue(['admin', 'employer']);

    // Act
    const result = guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
  });

  it('should throw an error if the user is missing from the request', async () => {
    // Arrange: Create a context where user is undefined, customized for this test
    const context = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: undefined }),
      }),
    } as unknown as ExecutionContext;

    reflectorMock.getAllAndOverride.mockReturnValue(['admin']);

    // Act & Assert
    expect(() => guard.canActivate(context)).toThrow(
      'User not found in request. Make sure you are using the AuthGuard.'
    );
  });
});
