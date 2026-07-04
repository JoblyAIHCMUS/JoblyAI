import { describe, it, expect, vi } from 'vitest';
import { whoamiHandler } from '../app/mcp/tools/whoami.tool';
import { McpState } from '../app/mcp/server/mcp.types';

const buildState = (user: unknown): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    user: { findUnique: vi.fn().mockResolvedValue(user) },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
});

describe('whoamiHandler', () => {
  it('returns user profile when user exists', async () => {
    const state = buildState({
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'candidate',
      employer: null,
      candidateDescription: { id: 'desc-1' },
      resumes: [],
    });

    const result = await whoamiHandler(state);

    expect(result.structuredContent).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'candidate',
      hasCandidateProfile: true,
      hasEmployerProfile: false,
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
  });

  it('returns isError when user not found', async () => {
    const state = buildState(null);

    const result = await whoamiHandler(state);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('User not found');
  });

  it('returns isError and logs when Prisma throws', async () => {
    const state: McpState = {
      userId: 'user-123',
      role: 'candidate',
      companyId: null,
      prisma: {
        user: { findUnique: vi.fn().mockRejectedValue(new Error('DB error')) },
      } as never,
      logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
    };

    const result = await whoamiHandler(state);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
    expect(state.logger.error).toHaveBeenCalled();
  });
});
