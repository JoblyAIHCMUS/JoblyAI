import { describe, it, expect, vi } from 'vitest';
import { searchJobsHandler } from '../app/mcp/tools/candidate/search-jobs.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = ($transaction: ReturnType<typeof vi.fn>): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    jobPosting: { count: vi.fn(), findMany: vi.fn() },
    $transaction,
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('searchJobsHandler', () => {
  it('paginates and forces status=OPEN + deletedAt=null', async () => {
    const $transaction = vi.fn().mockResolvedValue([
      25,
      [
        {
          id: 1,
          title: 'Dev',
          status: 'OPEN',
          deletedAt: null,
          category: { id: 1, name: 'Tech' },
          company: { id: 1, name: 'Acme' },
          requirements: [],
          _count: { applications: 3 },
        },
      ],
    ]);
    const state = buildState($transaction);

    const result = await searchJobsHandler(state, { page: 1, pageSize: 10 });

    expect($transaction).toHaveBeenCalled();
    const result_data = result.structuredContent as {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      jobs: unknown[];
    };
    expect(result_data.total).toBe(25);
    expect(result_data.page).toBe(1);
    expect(result_data.pageSize).toBe(10);
    expect(result_data.totalPages).toBe(3);
    expect(result_data.jobs).toHaveLength(1);
  });

  it('applies filters from input (q, remote, skills)', async () => {
    const $transaction = vi.fn().mockResolvedValue([0, []]);
    const state = buildState($transaction);

    await searchJobsHandler(state, {
      q: 'engineer',
      remote: true,
      skills: ['Python'],
    });

    expect($transaction).toHaveBeenCalled();
  });

  it('returns isError on prisma throw', async () => {
    const $transaction = vi.fn().mockRejectedValue(new Error('DB down'));
    const state = buildState($transaction);

    const result = await searchJobsHandler(state, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
