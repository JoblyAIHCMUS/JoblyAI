import { describe, it, expect, vi } from 'vitest';
import { getMyProfileHandler } from '../app/mcp/tools/candidate/get-my-profile.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (findUnique: ReturnType<typeof vi.fn>): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    candidateDescription: { findUnique },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: { calculateExplanation: vi.fn().mockResolvedValue(undefined) } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: { createNotifications: vi.fn().mockResolvedValue([]) } as never,
});

describe('getMyProfileHandler', () => {
  it('returns profile when CandidateDescription exists', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      candidateId: 'user-123',
      title: 'Senior Dev',
      bio: 'I code things',
      rawDescriptions: null,
      rawTitles: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    });
    const state = buildState(findUnique);

    const result = await getMyProfileHandler(state);

    expect(findUnique).toHaveBeenCalledWith({
      where: { candidateId: 'user-123' },
    });
    expect(result.structuredContent).toMatchObject({
      title: 'Senior Dev',
      bio: 'I code things',
    });
  });

  it('returns all-nulls when no CandidateDescription', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const state = buildState(findUnique);

    const result = await getMyProfileHandler(state);

    expect(result.structuredContent).toMatchObject({
      id: null,
      title: null,
      bio: null,
    });
  });

  it('returns isError on prisma throw', async () => {
    const findUnique = vi.fn().mockRejectedValue(new Error('DB down'));
    const state = buildState(findUnique);

    const result = await getMyProfileHandler(state);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
