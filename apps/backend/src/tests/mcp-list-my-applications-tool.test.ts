import { describe, it, expect, vi } from 'vitest';
import { listMyApplicationsHandler } from '../app/mcp/tools/candidate/list-my-applications.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  count: ReturnType<typeof vi.fn>,
  findMany: ReturnType<typeof vi.fn>
): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    application: { count, findMany },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: {
    calculateExplanation: vi.fn().mockResolvedValue(undefined),
  } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: {
    createNotifications: vi.fn().mockResolvedValue([]),
  } as never,
});

describe('listMyApplicationsHandler', () => {
  it('filters by candidateId + optional status, paginates', async () => {
    const count = vi.fn().mockResolvedValue(5);
    const findMany = vi
      .fn()
      .mockResolvedValue([
        {
          id: 1,
          status: 'APPLIED',
          job: { id: 1, title: 'Dev' },
          resume: { id: 1 },
        },
      ]);
    const state = buildState(count, findMany);

    const result = await listMyApplicationsHandler(state, {
      page: 1,
      pageSize: 10,
      status: 'APPLIED',
    });

    expect(count).toHaveBeenCalledWith({
      where: { candidateId: 'user-123', status: 'APPLIED' },
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidateId: 'user-123', status: 'APPLIED' },
        skip: 0,
        take: 10,
      })
    );
    expect(result.structuredContent?.total).toBe(5);
    expect(result.structuredContent?.applications).toHaveLength(1);
  });

  it('omits status filter when not provided', async () => {
    const count = vi.fn().mockResolvedValue(0);
    const findMany = vi.fn().mockResolvedValue([]);
    const state = buildState(count, findMany);

    await listMyApplicationsHandler(state, { page: 1, pageSize: 10 });

    expect(count).toHaveBeenCalledWith({
      where: { candidateId: 'user-123' },
    });
  });

  it('returns isError on prisma throw', async () => {
    const count = vi.fn().mockRejectedValue(new Error('DB down'));
    const findMany = vi.fn();
    const state = buildState(count, findMany);

    const result = await listMyApplicationsHandler(state, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
