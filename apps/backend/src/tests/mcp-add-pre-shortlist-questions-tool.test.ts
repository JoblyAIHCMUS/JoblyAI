import { describe, it, expect, vi } from 'vitest';
import { addPreShortlistQuestionsHandler } from '../app/mcp/tools/employer/add-pre-shortlist-questions.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (opts: {
  findUnique: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  createMany: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
}): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 100,
  prisma: {
    jobPosting: { findUnique: opts.findUnique },
    preShortlistQuestion: {
      count: opts.count,
      createMany: opts.createMany,
      findMany: opts.findMany,
    },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

const sampleQuestions = [
  { question: 'Q1 text', expectedAnswer: 'A1 text' },
  { question: 'Q2 text', expectedAnswer: 'A2 text' },
];

describe('addPreShortlistQuestionsHandler', () => {
  it('appends questions with order existingCount+0, +1 and returns { added, questionIds }', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 0 },
    });
    const count = vi.fn().mockResolvedValue(3); // 3 existing
    const createMany = vi.fn().mockResolvedValue({ count: 2 });
    const findMany = vi
      .fn()
      .mockResolvedValue([{ id: 'new1' }, { id: 'new2' }]);
    const state = buildState({ findUnique, count, createMany, findMany });

    const result = await addPreShortlistQuestionsHandler(state, {
      jobId: 42,
      questions: sampleQuestions,
    });

    expect(createMany).toHaveBeenCalledWith({
      data: [
        { jobId: 42, order: 3, question: 'Q1 text', expectedAnswer: 'A1 text' },
        { jobId: 42, order: 4, question: 'Q2 text', expectedAnswer: 'A2 text' },
      ],
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { jobId: 42, order: { gte: 3 } },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    expect(result.structuredContent).toEqual({
      added: 2,
      questionIds: ['new1', 'new2'],
    });
    expect(result.isError).toBeUndefined();
  });

  it('returns isError "Cannot edit..." when job has applications', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 1 },
    });
    const count = vi.fn();
    const createMany = vi.fn();
    const findMany = vi.fn();
    const state = buildState({ findUnique, count, createMany, findMany });

    const result = await addPreShortlistQuestionsHandler(state, {
      jobId: 42,
      questions: sampleQuestions,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Cannot edit pre-shortlist questions after applications exist'
    );
    expect(count).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it('returns isError "Job not found" when jobId does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const count = vi.fn();
    const createMany = vi.fn();
    const findMany = vi.fn();
    const state = buildState({ findUnique, count, createMany, findMany });

    const result = await addPreShortlistQuestionsHandler(state, {
      jobId: 999,
      questions: sampleQuestions,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job not found');
    expect(count).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it('returns isError "Maximum 20..." when would exceed 20', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 0 },
    });
    const count = vi.fn().mockResolvedValue(19); // 19 existing + 2 = 21
    const createMany = vi.fn();
    const findMany = vi.fn();
    const state = buildState({ findUnique, count, createMany, findMany });

    const result = await addPreShortlistQuestionsHandler(state, {
      jobId: 42,
      questions: sampleQuestions,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Maximum 20 questions per job (would be 21)'
    );
    expect(createMany).not.toHaveBeenCalled();
  });

  it('returns isError "Forbidden" on cross-company attempt', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      companyId: 999, // different from state.companyId (100)
      _count: { applications: 0 },
    });
    const count = vi.fn();
    const createMany = vi.fn();
    const findMany = vi.fn();
    const state = buildState({ findUnique, count, createMany, findMany });

    const result = await addPreShortlistQuestionsHandler(state, {
      jobId: 42,
      questions: sampleQuestions,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Forbidden: job does not belong to your company'
    );
    expect(count).not.toHaveBeenCalled();
  });

  it('returns isError "Internal error" if Prisma throws', async () => {
    const findUnique = vi.fn().mockRejectedValue(new Error('DB down'));
    const count = vi.fn();
    const createMany = vi.fn();
    const findMany = vi.fn();
    const state = buildState({ findUnique, count, createMany, findMany });

    const result = await addPreShortlistQuestionsHandler(state, {
      jobId: 42,
      questions: sampleQuestions,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
