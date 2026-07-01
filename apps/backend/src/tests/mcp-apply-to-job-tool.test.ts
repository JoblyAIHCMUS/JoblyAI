import { describe, it, expect, vi } from 'vitest';
import { applyToJobHandler } from '../app/mcp/tools/candidate/apply-to-job.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  prismaMocks: Record<string, ReturnType<typeof vi.fn>>,
  serviceMocks?: Partial<Pick<McpState, 'matchExplanationService' | 'eventEmitter' | 'notificationsService'>>
): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    jobPosting: {
      findUnique: prismaMocks.jobPostingFindUnique ?? vi.fn(),
    },
    resume: {
      findUnique: prismaMocks.resumeFindUnique ?? vi.fn(),
      findFirst: prismaMocks.resumeFindFirst ?? vi.fn(),
    },
    application: {
      findFirst: prismaMocks.applicationFindFirst ?? vi.fn(),
      findUnique: prismaMocks.applicationFindUnique ?? vi.fn(),
      create: prismaMocks.applicationCreate ?? vi.fn(),
      update: prismaMocks.applicationUpdate ?? vi.fn(),
    },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: serviceMocks?.matchExplanationService ?? { calculateExplanation: vi.fn().mockResolvedValue(undefined) } as never,
  eventEmitter: serviceMocks?.eventEmitter ?? { emit: vi.fn() } as never,
  notificationsService: serviceMocks?.notificationsService ?? { createNotifications: vi.fn().mockResolvedValue([]) } as never,
});

describe('applyToJobHandler', () => {
  it('creates new application, awaits match explanation, resolves status, creates notifications', async () => {
    const job = { id: 1, title: 'Dev', status: 'OPEN', postedById: 'employer-1', preShortlistThreshold: 0 };
    const resume = { id: 10, candidateId: 'user-123' };
    const createdApp = { id: 100, status: 'APPLIED', matchPercentage: null };
    const withScore = { matchPercentage: 85 };
    const finalApp = { id: 100, status: 'APPLIED', matchPercentage: 85, job: { id: 1 }, resume: { id: 10 } };

    const state = buildState({
      jobPostingFindUnique: vi.fn()
        .mockResolvedValueOnce(job)
        .mockResolvedValueOnce({ _count: { preShortlistQuestions: 0 } }),
      resumeFindUnique: vi.fn().mockResolvedValue(resume),
      applicationFindFirst: vi.fn().mockResolvedValue(null),
      applicationCreate: vi.fn().mockResolvedValue(createdApp),
      applicationFindUnique: vi.fn()
        .mockResolvedValueOnce(withScore)
        .mockResolvedValueOnce(finalApp),
      applicationUpdate: vi.fn(),
    });

    const result = await applyToJobHandler(state, { jobId: 1, resumeId: 10 });

    expect(state.matchExplanationService.calculateExplanation).toHaveBeenCalledWith(100);
    expect(state.eventEmitter.emit).toHaveBeenCalledWith('job.viewed', { jobId: 1 });
    expect(state.notificationsService.createNotifications).toHaveBeenCalled();
    expect(result.structuredContent?.matchPercentage).toBe(85);
  });

  it('re-applies after WITHDRAWN (updates existing, resets matchPercentage)', async () => {
    const job = { id: 1, title: 'Dev', status: 'OPEN', postedById: 'employer-1', preShortlistThreshold: 0 };
    const existing = { id: 100, candidateId: 'user-123', status: 'WITHDRAWN' };
    const updated = { id: 100, status: 'APPLIED', matchPercentage: null };
    const withScore = { matchPercentage: 90 };
    const finalApp = { id: 100, status: 'APPLIED', matchPercentage: 90, job: { id: 1 }, resume: { id: 10 } };

    const state = buildState({
      jobPostingFindUnique: vi.fn()
        .mockResolvedValueOnce(job)
        .mockResolvedValueOnce({ _count: { preShortlistQuestions: 0 } }),
      resumeFindUnique: vi.fn().mockResolvedValue({ id: 10, candidateId: 'user-123' }),
      applicationFindFirst: vi.fn().mockResolvedValue(existing),
      applicationUpdate: vi.fn().mockResolvedValueOnce(updated),
      applicationFindUnique: vi.fn()
        .mockResolvedValueOnce(withScore)
        .mockResolvedValueOnce(finalApp),
      applicationCreate: vi.fn(),
    });

    const result = await applyToJobHandler(state, { jobId: 1, resumeId: 10 });

    expect(state.prisma.application.create).not.toHaveBeenCalled();
    expect(result.structuredContent?.matchPercentage).toBe(90);
  });

  it('rejects when job is not OPEN', async () => {
    const state = buildState({
      jobPostingFindUnique: vi.fn().mockResolvedValue({ id: 1, title: 'Dev', status: 'CLOSED', postedById: 'e-1', preShortlistThreshold: 0 }),
    });

    const result = await applyToJobHandler(state, { jobId: 1, resumeId: 10 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job is not open for applications');
  });
});
