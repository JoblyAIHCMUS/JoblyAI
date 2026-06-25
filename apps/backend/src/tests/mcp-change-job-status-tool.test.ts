import { describe, it, expect, vi } from 'vitest';
import { changeJobStatusHandler } from '../app/mcp/tools/employer/change-job-status.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  findFirst: ReturnType<typeof vi.fn>,
  update: ReturnType<typeof vi.fn>
): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 42,
  prisma: {
    jobPosting: { findFirst, update },
    application: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
});

describe('changeJobStatusHandler', () => {
  it('changes status when caller owns the job', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValue({ id: 1, postedById: 'user-123' });
    const update = vi.fn().mockResolvedValue({ id: 1, status: 'CLOSED' });
    const state = buildState(findFirst, update);

    const result = await changeJobStatusHandler(state, {
      id: 1,
      status: 'CLOSED',
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { status: 'CLOSED' },
      })
    );
    expect(result.structuredContent).toMatchObject({ id: 1, status: 'CLOSED' });
  });

  it('returns isError "Job not found" when job does not exist', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const update = vi.fn();
    const state = buildState(findFirst, update);

    const result = await changeJobStatusHandler(state, {
      id: 999,
      status: 'OPEN',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job not found');
  });

  it('returns isError when caller does not own the job', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValue({ id: 1, postedById: 'someone-else' });
    const update = vi.fn();
    const state = buildState(findFirst, update);

    const result = await changeJobStatusHandler(state, {
      id: 1,
      status: 'CLOSED',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      "Forbidden: only the job poster can change this job's status"
    );
  });
});
