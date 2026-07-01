import { describe, it, expect, vi } from 'vitest';
import { listSkillsHandler } from '../app/mcp/tools/employer/list-skills.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (findMany: ReturnType<typeof vi.fn>): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 42,
  prisma: { skill: { findMany } } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: {
    calculateExplanation: vi.fn().mockResolvedValue(undefined),
  } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: {
    createNotifications: vi.fn().mockResolvedValue([]),
  } as never,
});

describe('listSkillsHandler', () => {
  it('returns skills sorted by name', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 1, name: 'Python' },
      { id: 2, name: 'TypeScript' },
    ]);
    const state = buildState(findMany);

    const result = await listSkillsHandler(state);

    expect(findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(result.structuredContent).toEqual({
      skills: [
        { id: 1, name: 'Python' },
        { id: 2, name: 'TypeScript' },
      ],
    });
  });

  it('returns empty array when no skills exist', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const state = buildState(findMany);

    const result = await listSkillsHandler(state);

    expect(result.structuredContent).toEqual({ skills: [] });
  });

  it('returns isError when Prisma throws', async () => {
    const findMany = vi.fn().mockRejectedValue(new Error('DB error'));
    const state = buildState(findMany);

    const result = await listSkillsHandler(state);

    expect(result.isError).toBe(true);
  });
});
