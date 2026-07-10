import { describe, it, expect, vi } from 'vitest';
import { getPreShortlistQuestionsHandler } from '../app/mcp/tools/employer/get-pre-shortlist-questions.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (opts: {
  findUnique: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
}): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 100,
  prisma: {
    jobPosting: { findUnique: opts.findUnique },
    preShortlistQuestion: { findMany: opts.findMany },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('getPreShortlistQuestionsHandler', () => {
  it('returns questions ordered by `order` ASC when ownership OK', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 0 },
    });
    const findMany = vi.fn().mockResolvedValue([
      { id: 'q1', question: 'Q1', expectedAnswer: 'A1', order: 0 },
      { id: 'q2', question: 'Q2', expectedAnswer: 'A2', order: 1 },
    ]);
    const state = buildState({ findUnique, findMany });

    const result = await getPreShortlistQuestionsHandler(state, { jobId: 42 });

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 42 },
      select: expect.objectContaining({ companyId: true }),
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { jobId: 42 },
      orderBy: { order: 'asc' },
    });
    expect(result.structuredContent).toEqual({
      questions: [
        { id: 'q1', question: 'Q1', expectedAnswer: 'A1', order: 0 },
        { id: 'q2', question: 'Q2', expectedAnswer: 'A2', order: 1 },
      ],
    });
    expect(result.isError).toBeUndefined();
  });

  it('returns empty array when job has no questions (no error)', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 0 },
    });
    const findMany = vi.fn().mockResolvedValue([]);
    const state = buildState({ findUnique, findMany });

    const result = await getPreShortlistQuestionsHandler(state, { jobId: 42 });

    expect(result.structuredContent).toEqual({ questions: [] });
    expect(result.isError).toBeUndefined();
  });

  it('returns isError "Job not found" when jobId does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const findMany = vi.fn();
    const state = buildState({ findUnique, findMany });

    const result = await getPreShortlistQuestionsHandler(state, { jobId: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job not found');
    expect(findMany).not.toHaveBeenCalled();
  });

  it('returns isError "Forbidden" when job belongs to another company', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      companyId: 999, // different from state.companyId (100)
      _count: { applications: 0 },
    });
    const findMany = vi.fn();
    const state = buildState({ findUnique, findMany });

    const result = await getPreShortlistQuestionsHandler(state, { jobId: 42 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Forbidden: job does not belong to your company'
    );
    expect(findMany).not.toHaveBeenCalled();
  });
});
