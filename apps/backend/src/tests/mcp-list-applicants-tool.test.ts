import { describe, it, expect, vi } from 'vitest';
import { listApplicantsHandler } from '../app/mcp/tools/employer/list-applicants.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  findUnique: ReturnType<typeof vi.fn>,
  $transaction: ReturnType<typeof vi.fn>,
  companyId: number | null = 42
): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId,
  prisma: {
    jobPosting: { findUnique },
    application: { count: vi.fn(), findMany: vi.fn() },
    $transaction,
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: { calculateExplanation: vi.fn().mockResolvedValue(undefined) } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: { createNotifications: vi.fn().mockResolvedValue([]) } as never,
});

describe('listApplicantsHandler', () => {
  it('returns applicants for a job the caller owns', async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: 1, companyId: 42 });
    const $transaction = vi.fn().mockResolvedValue([
      1,
      [
        {
          id: 100,
          status: 'APPLIED',
          job: { id: 1 },
          candidate: { id: 'c-1', name: 'Alice', email: 'a@x' },
        },
      ],
    ]);
    const state = buildState(findUnique, $transaction);

    const result = await listApplicantsHandler(state, { jobId: 1 });

    expect($transaction).toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({
      total: 1,
      applications: [expect.objectContaining({ id: 100, status: 'APPLIED' })],
    });
  });

  it('returns isError "Job not found" when job does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const $transaction = vi.fn();
    const state = buildState(findUnique, $transaction);

    const result = await listApplicantsHandler(state, { jobId: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job not found');
  });

  it('returns isError "Forbidden" when job belongs to another company', async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: 1, companyId: 99 });
    const $transaction = vi.fn();
    const state = buildState(findUnique, $transaction);

    const result = await listApplicantsHandler(state, { jobId: 1 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Forbidden: job does not belong to your company'
    );
  });
});
