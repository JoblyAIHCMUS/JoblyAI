import { describe, it, expect, vi } from 'vitest';
import { listCategoriesHandler } from '../app/mcp/tools/employer/list-categories.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  jobCategory: { findMany: ReturnType<typeof vi.fn> },
): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 42,
  prisma: { jobCategory } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
});

describe('listCategoriesHandler', () => {
  it('returns categories sorted by name', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 1, name: 'Backend', slug: 'backend', iconKey: 'cpu' },
      { id: 2, name: 'Frontend', slug: 'frontend', iconKey: 'monitor' },
    ]);
    const state = buildState({ findMany });

    const result = await listCategoriesHandler(state);

    expect(findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(result.structuredContent).toEqual([
      { id: 1, name: 'Backend', slug: 'backend', iconKey: 'cpu' },
      { id: 2, name: 'Frontend', slug: 'frontend', iconKey: 'monitor' },
    ]);
  });

  it('returns empty array when no categories exist', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const state = buildState({ findMany });

    const result = await listCategoriesHandler(state);

    expect(result.structuredContent).toEqual([]);
  });

  it('returns isError when Prisma throws', async () => {
    const findMany = vi.fn().mockRejectedValue(new Error('DB error'));
    const state = buildState({ findMany });

    const result = await listCategoriesHandler(state);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
