import { describe, it, expect, vi } from 'vitest';
import { updateProfileHandler } from '../app/mcp/tools/candidate/update-profile.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (upsert: ReturnType<typeof vi.fn>): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    candidateDescription: { upsert },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: { calculateExplanation: vi.fn().mockResolvedValue(undefined) } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: { createNotifications: vi.fn().mockResolvedValue([]) } as never,
});

describe('updateProfileHandler', () => {
  it('updates existing profile with both fields', async () => {
    const upsert = vi.fn().mockResolvedValue({
      id: 1, candidateId: 'user-123', title: 'Dev', bio: 'Bio',
      rawDescriptions: null, rawTitles: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
    const state = buildState(upsert);

    const result = await updateProfileHandler(state, { title: 'Dev', bio: 'Bio' });

    expect(upsert).toHaveBeenCalledWith({
      where: { candidateId: 'user-123' },
      create: { candidateId: 'user-123', title: 'Dev', bio: 'Bio' },
      update: { title: 'Dev', bio: 'Bio' },
    });
    expect(result.structuredContent?.title).toBe('Dev');
  });

  it('creates profile via upsert when it does not exist', async () => {
    const upsert = vi.fn().mockResolvedValue({
      id: 2, candidateId: 'user-123', title: 'New', bio: 'New bio',
      rawDescriptions: null, rawTitles: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
    const state = buildState(upsert);

    await updateProfileHandler(state, { title: 'New', bio: 'New bio' });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidateId: 'user-123' },
        create: expect.objectContaining({ candidateId: 'user-123' }),
      })
    );
  });

  it('partial update with only title', async () => {
    const upsert = vi.fn().mockResolvedValue({
      id: 1, candidateId: 'user-123', title: 'Updated', bio: 'old bio',
      rawDescriptions: null, rawTitles: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
    const state = buildState(upsert);

    await updateProfileHandler(state, { title: 'Updated' });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { title: 'Updated' },
      })
    );
  });
});
