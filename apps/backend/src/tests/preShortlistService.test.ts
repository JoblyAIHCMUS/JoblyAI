// apps/backend/src/tests/preShortlistService.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import type { Queue } from 'bullmq';
import { PreShortlistService } from '../app/pre-shortlist/pre-shortlist.service';
import { buildEvaluateAnswersPrompt } from '../app/pre-shortlist/prompts/evaluate-answers';

// ---------- Mocks ----------

const mockPrisma = vi.hoisted(() => ({
  jobPosting: {
    findUnique: vi.fn(),
  },
  application: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  preShortlistQuestion: {
    findMany: vi.fn(),
  },
  preShortlistAnswer: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
}));

const mockQueue = vi.hoisted(() => ({
  add: vi.fn(),
})) as unknown as Queue;

const mockAiGateway = vi.hoisted(() => ({
  notifyUser: vi.fn(),
}));

// ---------- Tests ----------

describe('buildEvaluateAnswersPrompt', () => {
  it('includes every question and answer in the prompt body', () => {
    const prompt = buildEvaluateAnswersPrompt({
      jobTitle: 'Backend Engineer',
      jobDescription: 'Build APIs.',
      requirements: [
        {
          skillName: 'Postgres',
          importance: 'REQUIRED',
          minYearsExperience: 3,
        },
      ],
      questions: [
        {
          id: 'q1',
          question: 'Tell me about a Postgres optimization you did.',
        },
        { id: 'q2', question: 'Why do you want this role?' },
      ],
      answers: [
        {
          questionId: 'q1',
          answer: 'I added a partial index that cut query time 80%.',
        },
        {
          questionId: 'q2',
          answer: 'I want to deepen my distributed systems experience.',
        },
      ],
    });

    expect(prompt).toContain('Backend Engineer');
    expect(prompt).toContain('Postgres');
    expect(prompt).toContain('q1');
    expect(prompt).toContain('q2');
    expect(prompt).toContain('partial index');
    expect(prompt).toContain('STRONG_FIT');
    expect(prompt).toContain('STRONG|MAYBE|NO');
    expect(prompt).toContain('exactly 2 entries');
  });
});

describe('PreShortlistService.validateQuestions', () => {
  let service: PreShortlistService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PreShortlistService(
      mockPrisma as any,
      mockQueue,
      mockAiGateway as any
    );
  });

  it('accepts an empty array', () => {
    expect(() => service.validateQuestions([])).not.toThrow();
    expect(() => service.validateQuestions(undefined)).not.toThrow();
  });

  it('rejects more than 20 questions', () => {
    const qs = Array.from({ length: 21 }, () => 'A question');
    expect(() => service.validateQuestions(qs)).toThrow(BadRequestException);
  });

  it('rejects a question longer than 500 characters', () => {
    expect(() => service.validateQuestions(['x'.repeat(501)])).toThrow(
      BadRequestException
    );
  });
});

describe('PreShortlistService.resolveInitialStatus', () => {
  let service: PreShortlistService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PreShortlistService(
      mockPrisma as any,
      mockQueue,
      mockAiGateway as any
    );
  });

  it('returns APPLIED when the job has no threshold', async () => {
    mockPrisma.jobPosting.findUnique.mockResolvedValue({
      preShortlistThreshold: 0,
      _count: { preShortlistQuestions: 5 },
    });
    const result = await service.resolveInitialStatus(1, 95);
    expect(result).toBe('APPLIED');
  });

  it('returns APPLIED when the job has no questions', async () => {
    mockPrisma.jobPosting.findUnique.mockResolvedValue({
      preShortlistThreshold: 50,
      _count: { preShortlistQuestions: 0 },
    });
    const result = await service.resolveInitialStatus(1, 95);
    expect(result).toBe('APPLIED');
  });

  it('returns APPLIED when matchPercentage is below threshold', async () => {
    mockPrisma.jobPosting.findUnique.mockResolvedValue({
      preShortlistThreshold: 50,
      _count: { preShortlistQuestions: 3 },
    });
    const result = await service.resolveInitialStatus(1, 30);
    expect(result).toBe('APPLIED');
  });

  it('returns PRE_SHORTLIST_PENDING when matchPercentage meets threshold and questions exist', async () => {
    mockPrisma.jobPosting.findUnique.mockResolvedValue({
      preShortlistThreshold: 50,
      _count: { preShortlistQuestions: 3 },
    });
    const result = await service.resolveInitialStatus(1, 75);
    expect(result).toBe('PRE_SHORTLIST_PENDING');
  });

  it('returns PRE_SHORTLIST_PENDING when matchPercentage exactly equals threshold', async () => {
    mockPrisma.jobPosting.findUnique.mockResolvedValue({
      preShortlistThreshold: 50,
      _count: { preShortlistQuestions: 3 },
    });
    const result = await service.resolveInitialStatus(1, 50);
    expect(result).toBe('PRE_SHORTLIST_PENDING');
  });

  it('returns APPLIED when matchPercentage is null and threshold > 0', async () => {
    mockPrisma.jobPosting.findUnique.mockResolvedValue({
      preShortlistThreshold: 50,
      _count: { preShortlistQuestions: 3 },
    });
    const result = await service.resolveInitialStatus(1, null);
    expect(result).toBe('APPLIED');
  });

  it('returns APPLIED when the job does not exist', async () => {
    mockPrisma.jobPosting.findUnique.mockResolvedValue(null);
    const result = await service.resolveInitialStatus(1, 95);
    expect(result).toBe('APPLIED');
  });
});

describe('PreShortlistService.submitAnswers', () => {
  let service: PreShortlistService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PreShortlistService(
      mockPrisma as any,
      mockQueue,
      mockAiGateway as any
    );
  });

  const baseApp = {
    id: 1,
    candidateId: 'cand-1',
    status: 'PRE_SHORTLIST_PENDING' as const,
    aiFeedback: null,
    job: {
      preShortlistQuestions: [
        { id: 'q1', order: 0, question: 'Q1?' },
        { id: 'q2', order: 1, question: 'Q2?' },
      ],
    },
  };

  it('throws NotFound if application does not exist', async () => {
    mockPrisma.application.findUnique.mockResolvedValue(null);
    await expect(
      service.submitAnswers(99, 'cand-1', { answers: [] })
    ).rejects.toThrow(NotFoundException);
  });

  it('throws Forbidden if the candidate does not own the application', async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      ...baseApp,
      candidateId: 'someone-else',
    });
    await expect(
      service.submitAnswers(1, 'cand-1', {
        answers: [
          { questionId: 'q1', answer: 'a'.repeat(25) },
          { questionId: 'q2', answer: 'b'.repeat(25) },
        ],
      })
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws Conflict if status is not PRE_SHORTLIST_PENDING', async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      ...baseApp,
      status: 'PRE_SHORTLIST_SUBMITTED',
    });
    await expect(
      service.submitAnswers(1, 'cand-1', {
        answers: [
          { questionId: 'q1', answer: 'a'.repeat(25) },
          { questionId: 'q2', answer: 'b'.repeat(25) },
        ],
      })
    ).rejects.toThrow(ConflictException);
  });

  it('throws BadRequest if answer count does not match question count', async () => {
    mockPrisma.application.findUnique.mockResolvedValue(baseApp);
    await expect(
      service.submitAnswers(1, 'cand-1', {
        answers: [{ questionId: 'q1', answer: 'a'.repeat(25) }],
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequest if an answer is too short', async () => {
    mockPrisma.application.findUnique.mockResolvedValue(baseApp);
    await expect(
      service.submitAnswers(1, 'cand-1', {
        answers: [
          { questionId: 'q1', answer: 'short' },
          { questionId: 'q2', answer: 'b'.repeat(25) },
        ],
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequest if questionId is unknown', async () => {
    mockPrisma.application.findUnique.mockResolvedValue(baseApp);
    await expect(
      service.submitAnswers(1, 'cand-1', {
        answers: [
          { questionId: 'q1', answer: 'a'.repeat(25) },
          { questionId: 'qX', answer: 'b'.repeat(25) },
        ],
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('happy path: persists, transitions to PRE_SHORTLIST_SUBMITTED, enqueues', async () => {
    mockPrisma.application.findUnique.mockResolvedValue(baseApp);
    await service.submitAnswers(1, 'cand-1', {
      answers: [
        { questionId: 'q1', answer: 'a'.repeat(25) },
        { questionId: 'q2', answer: 'b'.repeat(25) },
      ],
    });
    expect(mockPrisma.preShortlistAnswer.deleteMany).toHaveBeenCalledWith({
      where: { applicationId: 1 },
    });
    expect(mockPrisma.preShortlistAnswer.createMany).toHaveBeenCalled();
    expect(mockPrisma.application.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'PRE_SHORTLIST_SUBMITTED' }),
      })
    );
    expect(mockQueue.add).toHaveBeenCalledWith(
      'evaluate-answers',
      { applicationId: 1 },
      expect.any(Object)
    );
  });
});
