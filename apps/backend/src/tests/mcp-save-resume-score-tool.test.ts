import { describe, it, expect, vi } from 'vitest';
import { saveResumeScoreHandler } from '../app/mcp/tools/candidate/save-resume-score.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (opts: {
  resume: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  } | null;
}): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: { resume: opts.resume } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

const sampleFeedback = {
  score: 85,
  strengths: ['Clear structure'],
  weaknesses: ['Vague metrics'],
  suggestions: ['Quantify impact'],
  auditReport: {
    impact: {
      status: 'needs_improvement' as const,
      ruleName: 'Google XYZ Formula',
      ruleSource: 'Google XYZ',
      critique: 'Lacks quantitative metrics.',
      brokenRulesExplanation: 'Statements lack numbers.',
    },
    language: {
      status: 'excellent' as const,
      ruleName: 'Harvard Action Verbs',
      ruleSource: 'Harvard Business School',
      critique: 'Strong action verbs used throughout.',
      brokenRulesExplanation: '',
    },
  },
  detailedStrengths: [],
  detailedWeaknesses: [],
  rewriteSuggestions: [],
  generalAdvice: 'Add metrics.',
  formatting: 'good',
  impact: 'medium',
};

describe('saveResumeScoreHandler', () => {
  it('updates aiScore + aiFeedback on the Resume and returns success', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'user-123',
    });
    const update = vi.fn().mockResolvedValue({ id: 42 });
    const state = buildState({ resume: { findUnique, update } });

    const result = await saveResumeScoreHandler(state, {
      resumeId: 42,
      score: 85,
      feedback: sampleFeedback,
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { aiScore: 85, aiFeedback: sampleFeedback },
    });
    expect(result.structuredContent).toEqual({ success: true });
  });

  it('returns isError when resume not found', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const state = buildState({
      resume: { findUnique, update: vi.fn() },
    });

    const result = await saveResumeScoreHandler(state, {
      resumeId: 999,
      score: 50,
      feedback: sampleFeedback,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Resume not found');
  });

  it('returns isError when access denied', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'other-user',
    });
    const state = buildState({
      resume: { findUnique, update: vi.fn() },
    });

    const result = await saveResumeScoreHandler(state, {
      resumeId: 42,
      score: 50,
      feedback: sampleFeedback,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Access denied');
  });

  it('returns isError when prisma update throws', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'user-123',
    });
    const update = vi.fn().mockRejectedValue(new Error('DB down'));
    const state = buildState({ resume: { findUnique, update } });

    const result = await saveResumeScoreHandler(state, {
      resumeId: 42,
      score: 50,
      feedback: sampleFeedback,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
