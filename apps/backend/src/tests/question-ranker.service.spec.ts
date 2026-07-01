import { describe, expect, it } from 'vitest';
import { QuestionRankerService } from '../app/ai/interview-preparation/ranking/question-ranker.service.js';

describe('QuestionRankerService', () => {
  const service = new QuestionRankerService();

  it('calculates a deterministic score and sorts questions by descending score', () => {
    const result = service.rank([
      {
        question: 'Question C',
        evidenceCount: 2,
        confidence: 0.6,
        sources: ['c1', 'c2'],
        contexts: ['context c'],
      },
      {
        question: 'Question A',
        evidenceCount: 4,
        confidence: 0.7,
        sources: ['a1', 'a2', 'a3', 'a4'],
        contexts: ['context a'],
      },
      {
        question: 'Question B',
        evidenceCount: 2,
        confidence: 0.9,
        sources: ['b1', 'b2'],
        contexts: ['context b'],
      },
    ]);

    expect(result).toEqual([
      {
        question: 'Question A',
        evidenceCount: 4,
        confidence: 0.7,
        sources: ['a1', 'a2', 'a3', 'a4'],
        contexts: ['context a'],
        score: 4070,
      },
      {
        question: 'Question B',
        evidenceCount: 2,
        confidence: 0.9,
        sources: ['b1', 'b2'],
        contexts: ['context b'],
        score: 2090,
      },
      {
        question: 'Question C',
        evidenceCount: 2,
        confidence: 0.6,
        sources: ['c1', 'c2'],
        contexts: ['context c'],
        score: 2060,
      },
    ]);
  });

  it('returns an empty array for invalid or empty input', () => {
    expect(service.rank([])).toEqual([]);
    expect(service.rank(null as unknown as [])).toEqual([]);
  });
});