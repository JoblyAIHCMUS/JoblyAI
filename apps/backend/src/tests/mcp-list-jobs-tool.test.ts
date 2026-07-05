import { describe, it, expect, vi } from 'vitest';
import { listJobsHandler } from '../app/mcp/tools/employer/list-jobs.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  findMany: ReturnType<typeof vi.fn>,
  count: ReturnType<typeof vi.fn>
): McpState => {
  const $transaction = vi.fn((promises: Array<Promise<unknown>>) =>
    Promise.all(promises)
  );
  return {
    userId: 'user-123',
    role: 'employer',
    companyId: 42,
    prisma: {
      jobPosting: { count, findMany },
      $transaction,
    } as never,
    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
    gcsService: {} as never,
    resumeParserService: {} as never,
    profileSyncService: {} as never,
  };
};

describe('listJobsHandler', () => {
  it('returns paginated jobs for the caller', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([
        { id: 1, title: 'Backend Engineer', description: 'desc' },
      ]);
    const count = vi.fn().mockResolvedValue(1);
    const state = buildState(findMany, count);

    const result = await listJobsHandler(state, { page: 1, pageSize: 10 });

    expect(state.prisma.$transaction).toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    expect((result.structuredContent as { jobs: unknown[] }).jobs).toHaveLength(
      1
    );
  });

  it('uses defaults page=1 pageSize=10 when not provided', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const state = buildState(findMany, count);

    const result = await listJobsHandler(state, {});

    expect(result.structuredContent).toMatchObject({
      page: 1,
      pageSize: 10,
    });
  });

  it('returns isError when Prisma throws', async () => {
    const state: McpState = {
      userId: 'user-123',
      role: 'employer',
      companyId: 42,
      prisma: {
        $transaction: vi.fn().mockRejectedValue(new Error('DB error')),
      } as never,
      logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
      gcsService: {} as never,
      resumeParserService: {} as never,
      profileSyncService: {} as never,
    };

    const result = await listJobsHandler(state, { page: 1, pageSize: 10 });

    expect(result.isError).toBe(true);
    expect(state.logger.error).toHaveBeenCalled();
  });
});
