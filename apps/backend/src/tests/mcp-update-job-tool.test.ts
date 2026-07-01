import { describe, it, expect, vi } from 'vitest';
import { updateJobHandler } from '../app/mcp/tools/employer/update-job.tool';
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
  matchExplanationService: { calculateExplanation: vi.fn().mockResolvedValue(undefined) } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: { createNotifications: vi.fn().mockResolvedValue([]) } as never,
});

describe('updateJobHandler', () => {
  it('updates fields the caller owns', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValue({ id: 1, postedById: 'user-123' });
    const update = vi.fn().mockResolvedValue({
      id: 1,
      title: 'New Title',
      postedById: 'user-123',
      companyId: 42,
    });
    const state = buildState(findFirst, update);

    const result = await updateJobHandler(state, { id: 1, title: 'New Title' });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ title: 'New Title' }),
      })
    );
    expect(result.structuredContent).toMatchObject({
      id: 1,
      title: 'New Title',
    });
  });

  it('returns isError when job not found', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const update = vi.fn();
    const state = buildState(findFirst, update);

    const result = await updateJobHandler(state, { id: 999, title: 'X' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job not found');
    expect(update).not.toHaveBeenCalled();
  });

  it('returns isError when job posted by another user', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValue({ id: 1, postedById: 'someone-else' });
    const update = vi.fn();
    const state = buildState(findFirst, update);

    const result = await updateJobHandler(state, { id: 1, title: 'X' });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Forbidden: only the job poster can edit this job'
    );
    expect(update).not.toHaveBeenCalled();
  });
});
