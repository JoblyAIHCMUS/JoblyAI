import { describe, it, expect, vi } from 'vitest';
import { getJobHandler } from '../app/mcp/tools/employer/get-job.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (findUnique: ReturnType<typeof vi.fn>): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 42,
  prisma: { jobPosting: { findUnique } } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('getJobHandler', () => {
  it("returns the job when it belongs to the caller's company", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      title: 'Backend Engineer',
      description: 'desc',
      companyId: 42,
      category: { id: 1, name: 'Backend' },
      company: { id: 42, name: 'Acme' },
      requirements: [],
      _count: { applications: 5 },
    });
    const state = buildState(findUnique);

    const result = await getJobHandler(state, { id: 1 });

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: expect.objectContaining({
        category: true,
        company: true,
        requirements: expect.any(Object),
        _count: expect.any(Object),
      }),
    });
    expect(result.structuredContent).toMatchObject({
      id: 1,
      title: 'Backend Engineer',
    });
    expect(result.isError).toBeUndefined();
  });

  it('returns isError "Job not found" when job does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const state = buildState(findUnique);

    const result = await getJobHandler(state, { id: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job not found');
  });

  it('returns isError "Forbidden" when job belongs to another company', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      title: 'Other Co Job',
      companyId: 99,
      category: {},
      company: {},
      requirements: [],
      _count: { applications: 0 },
    });
    const state = buildState(findUnique);

    const result = await getJobHandler(state, { id: 1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Forbidden: job does not belong to your company'
    );
  });
});
