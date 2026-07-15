import { describe, it, expect, vi } from 'vitest';
import { updatePreShortlistQuestionHandler } from '../app/mcp/tools/employer/update-pre-shortlist-question.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (opts: {
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: 100,
  prisma: {
    preShortlistQuestion: {
      findUnique: opts.findUnique,
      update: opts.update,
    },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('updatePreShortlistQuestionHandler', () => {
  it('updates only the question field when only question provided', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'q1',
      job: { companyId: 100, _count: { applications: 0 } },
    });
    const update = vi.fn().mockResolvedValue({ id: 'q1' });
    const state = buildState({ findUnique, update });

    const result = await updatePreShortlistQuestionHandler(state, {
      questionId: 'q1',
      question: 'New question text',
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'q1' },
      data: { question: 'New question text' },
    });
    expect(result.structuredContent).toEqual({
      success: true,
      questionId: 'q1',
    });
    expect(result.isError).toBeUndefined();
  });

  it('updates only the expectedAnswer field when only expectedAnswer provided', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'q1',
      job: { companyId: 100, _count: { applications: 0 } },
    });
    const update = vi.fn().mockResolvedValue({ id: 'q1' });
    const state = buildState({ findUnique, update });

    const result = await updatePreShortlistQuestionHandler(state, {
      questionId: 'q1',
      expectedAnswer: 'New expected answer',
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'q1' },
      data: { expectedAnswer: 'New expected answer' },
    });
    expect(result.isError).toBeUndefined();
  });

  it('updates both fields when both provided', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'q1',
      job: { companyId: 100, _count: { applications: 0 } },
    });
    const update = vi.fn().mockResolvedValue({ id: 'q1' });
    const state = buildState({ findUnique, update });

    await updatePreShortlistQuestionHandler(state, {
      questionId: 'q1',
      question: 'Question',
      expectedAnswer: 'A',
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'q1' },
      data: { question: 'Question', expectedAnswer: 'A' },
    });
  });

  it('returns isError "Question not found" when questionId does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const update = vi.fn();
    const state = buildState({ findUnique, update });

    const result = await updatePreShortlistQuestionHandler(state, {
      questionId: 'missing',
      question: 'New text',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Question not found');
    expect(update).not.toHaveBeenCalled();
  });

  it('returns isError "Forbidden" on cross-company', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'q1',
      job: { companyId: 999, _count: { applications: 0 } },
    });
    const update = vi.fn();
    const state = buildState({ findUnique, update });

    const result = await updatePreShortlistQuestionHandler(state, {
      questionId: 'q1',
      question: 'New text',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Forbidden: job does not belong to your company'
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('returns isError "Cannot edit..." when job has applications', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'q1',
      job: { companyId: 100, _count: { applications: 5 } },
    });
    const update = vi.fn();
    const state = buildState({ findUnique, update });

    const result = await updatePreShortlistQuestionHandler(state, {
      questionId: 'q1',
      question: 'New text',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Cannot edit pre-shortlist questions after applications exist'
    );
    expect(update).not.toHaveBeenCalled();
  });
});
