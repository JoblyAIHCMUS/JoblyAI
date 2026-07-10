import { describe, it, expect, vi } from 'vitest';
import { removePreShortlistQuestionsHandler } from '../app/mcp/tools/employer/remove-pre-shortlist-questions.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (opts: {
  jobFindUnique: ReturnType<typeof vi.fn>;
  questionFindMany: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
  remainingFindMany: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  $transaction: ReturnType<typeof vi.fn>;
}): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 100,
  prisma: {
    jobPosting: { findUnique: opts.jobFindUnique },
    preShortlistQuestion: {
      findMany: opts.questionFindMany,
      deleteMany: opts.deleteMany,
      update: opts.update,
    },
    $transaction: opts.$transaction,
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('removePreShortlistQuestionsHandler', () => {
  it('deletes questions and returns { removed, remaining }', async () => {
    const jobFindUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 0 },
    });
    const questionFindMany = vi
      .fn()
      .mockResolvedValue([{ id: 'q1' }, { id: 'q2' }]);
    const deleteMany = vi.fn().mockResolvedValue({ count: 2 });
    const remainingFindMany = vi
      .fn()
      .mockResolvedValue([{ id: 'q3' }, { id: 'q4' }, { id: 'q5' }]);
    const update = vi.fn();
    const $transaction = vi.fn(async (cb) => {
      const tx = {
        preShortlistQuestion: {
          deleteMany,
          findMany: remainingFindMany,
          update,
        },
      };
      return cb(tx);
    });
    const state = buildState({
      jobFindUnique,
      questionFindMany,
      deleteMany,
      remainingFindMany,
      update,
      $transaction,
    });

    const result = await removePreShortlistQuestionsHandler(state, {
      jobId: 42,
      questionIds: ['q1', 'q2'],
    });

    expect(questionFindMany).toHaveBeenCalledWith({
      where: { id: { in: ['q1', 'q2'] }, jobId: 42 },
      select: { id: true },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['q1', 'q2'] } },
    });
    expect(remainingFindMany).toHaveBeenCalledWith({
      where: { jobId: 42 },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    expect(update).toHaveBeenCalledTimes(3);
    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: 'q3' },
      data: { order: 0 },
    });
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: 'q4' },
      data: { order: 1 },
    });
    expect(update).toHaveBeenNthCalledWith(3, {
      where: { id: 'q5' },
      data: { order: 2 },
    });
    expect(result.structuredContent).toEqual({
      removed: 2,
      remaining: 3,
    });
    expect(result.isError).toBeUndefined();
  });

  it('returns isError "Some questionIds do not belong..." on subset mismatch', async () => {
    const jobFindUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 0 },
    });
    const questionFindMany = vi.fn().mockResolvedValue([{ id: 'q1' }]);
    const deleteMany = vi.fn();
    const remainingFindMany = vi.fn();
    const update = vi.fn();
    const $transaction = vi.fn();
    const state = buildState({
      jobFindUnique,
      questionFindMany,
      deleteMany,
      remainingFindMany,
      update,
      $transaction,
    });

    const result = await removePreShortlistQuestionsHandler(state, {
      jobId: 42,
      questionIds: ['q1', 'q2'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Some questionIds do not belong to this job'
    );
    expect($transaction).not.toHaveBeenCalled();
  });

  it('returns isError "Job not found" when jobId does not exist', async () => {
    const jobFindUnique = vi.fn().mockResolvedValue(null);
    const questionFindMany = vi.fn();
    const deleteMany = vi.fn();
    const remainingFindMany = vi.fn();
    const update = vi.fn();
    const $transaction = vi.fn();
    const state = buildState({
      jobFindUnique,
      questionFindMany,
      deleteMany,
      remainingFindMany,
      update,
      $transaction,
    });

    const result = await removePreShortlistQuestionsHandler(state, {
      jobId: 999,
      questionIds: ['q1'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Job not found');
    expect(questionFindMany).not.toHaveBeenCalled();
    expect($transaction).not.toHaveBeenCalled();
  });

  it('returns isError "Forbidden" on cross-company', async () => {
    const jobFindUnique = vi.fn().mockResolvedValue({
      companyId: 999,
      _count: { applications: 0 },
    });
    const questionFindMany = vi.fn();
    const deleteMany = vi.fn();
    const remainingFindMany = vi.fn();
    const update = vi.fn();
    const $transaction = vi.fn();
    const state = buildState({
      jobFindUnique,
      questionFindMany,
      deleteMany,
      remainingFindMany,
      update,
      $transaction,
    });

    const result = await removePreShortlistQuestionsHandler(state, {
      jobId: 42,
      questionIds: ['q1'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Forbidden: job does not belong to your company'
    );
    expect($transaction).not.toHaveBeenCalled();
  });

  it('returns isError "Cannot edit..." when job has applications', async () => {
    const jobFindUnique = vi.fn().mockResolvedValue({
      companyId: 100,
      _count: { applications: 3 },
    });
    const questionFindMany = vi.fn();
    const deleteMany = vi.fn();
    const remainingFindMany = vi.fn();
    const update = vi.fn();
    const $transaction = vi.fn();
    const state = buildState({
      jobFindUnique,
      questionFindMany,
      deleteMany,
      remainingFindMany,
      update,
      $transaction,
    });

    const result = await removePreShortlistQuestionsHandler(state, {
      jobId: 42,
      questionIds: ['q1'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Cannot edit pre-shortlist questions after applications exist'
    );
    expect($transaction).not.toHaveBeenCalled();
  });
});
