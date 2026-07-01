import { describe, expect, it } from 'vitest';
import { QuestionVerifierService } from '../app/ai/interview-preparation/verification/question-verifier.service.js';

describe('QuestionVerifierService', () => {
  const service = new QuestionVerifierService();

  it('groups identical questions, deduplicates same-source duplicates, and aggregates evidence', () => {
    const result = service.verify([
      {
        question: 'How do you handle conflict?',
        source: 'Doc A',
        url: 'https://example.com/a',
        context: 'First context',
      },
      {
        question: ' How do you handle conflict? ',
        source: 'Doc A duplicate',
        url: 'https://example.com/a',
        context: 'First context duplicate',
      },
      {
        question: 'How do you handle conflict?',
        source: 'Doc B',
        url: 'https://example.com/b',
        context: 'Second context',
      },
      {
        question: 'Tell me about a time you failed.',
        source: 'Doc C',
        url: 'https://example.com/c',
        context: 'Another context',
      },
    ]);

    expect(result).toEqual([
      {
        question: 'How do you handle conflict?',
        evidenceCount: 2,
        confidence: 0.75,
        sources: ['https://example.com/a', 'https://example.com/b'],
        contexts: ['First context', 'Second context'],
      },
      {
        question: 'Tell me about a time you failed.',
        evidenceCount: 1,
        confidence: 0.6,
        sources: ['https://example.com/c'],
        contexts: ['Another context'],
      },
    ]);
  });

  it('returns an empty array for invalid or empty input', () => {
    expect(service.verify([])).toEqual([]);
    expect(service.verify(null as unknown as [])).toEqual([]);
  });
});