import { describe, expect, it } from 'vitest';
import { QuestionVerifierService } from '../app/ai/interview-preparation/verification/question-verifier.service.js';

describe('QuestionVerifierService', () => {
  const service = new QuestionVerifierService();

  it('validates, normalizes and filters questions by confidence and sources without merging duplicates', () => {
    const result = service.verify([
      {
        question: ' How do you handle conflict? ',
        category: ' Behavioral ',
        difficulty: 'Medium',
        relevance: ' Relevant behavioral prompt. ',
        confidence: 0.85,
        sources: [{ title: 'Doc A', url: 'https://example.com/a' }],
        sampleAnswer: 'sample 1',
        interviewerIntent: 'intent 1',
        tips: 'tips 1',
        origin: 'web_search',
      },
      {
        // Should be filtered out due to low confidence
        question: 'Explain Dependency Injection',
        category: 'Technical',
        difficulty: 'Hard',
        relevance: 'Not confident',
        confidence: 0.5,
        sources: [{ title: 'Doc B', url: 'https://example.com/b' }],
        sampleAnswer: 'sample 2',
        interviewerIntent: 'intent 2',
        tips: 'tips 2',
        origin: 'web_search',
      },
      {
        // Should be filtered out due to missing sources
        question: 'Explain TypeScript',
        category: 'Technical',
        difficulty: 'Easy',
        relevance: 'No sources',
        confidence: 0.9,
        sources: [],
        sampleAnswer: 'sample 3',
        interviewerIntent: 'intent 3',
        tips: 'tips 3',
        origin: 'web_search',
      },
      {
        question: 'Tell me about a time you failed.',
        category: 'Behavioral',
        difficulty: 'Hard',
        relevance: 'Failure analysis.',
        confidence: 0.75,
        sources: [
          { title: 'Doc C1', url: 'https://example.com/c1' },
          { title: 'Doc C2', url: 'https://example.com/c2' },
        ],
        sampleAnswer: 'sample 4',
        interviewerIntent: 'intent 4',
        tips: 'tips 4',
        origin: 'web_search',
      },
      {
        // AI generated question, should not be filtered out even if sources is empty
        question: 'AI Gen Question',
        category: 'Technical',
        difficulty: 'Easy',
        relevance: 'Gap analysis',
        confidence: 0.88,
        sources: [],
        sampleAnswer: 'sample 5',
        interviewerIntent: 'intent 5',
        tips: 'tips 5',
        origin: 'ai_generated',
        reasoning: 'Missing skill',
      },
    ]);

    expect(result).toEqual([
      {
        question: 'How do you handle conflict?',
        category: 'Behavioral',
        difficulty: 'Medium',
        relevance: 'Relevant behavioral prompt.',
        confidence: 0.85,
        sources: [{ title: 'Doc A', url: 'https://example.com/a' }],
        sampleAnswer: 'sample 1',
        interviewerIntent: 'intent 1',
        tips: 'tips 1',
        origin: 'web_search',
        reasoning: undefined,
      },
      {
        question: 'Tell me about a time you failed.',
        category: 'Behavioral',
        difficulty: 'Hard',
        relevance: 'Failure analysis.',
        confidence: 0.75,
        sources: [
          { title: 'Doc C1', url: 'https://example.com/c1' },
          { title: 'Doc C2', url: 'https://example.com/c2' },
        ],
        sampleAnswer: 'sample 4',
        interviewerIntent: 'intent 4',
        tips: 'tips 4',
        origin: 'web_search',
        reasoning: undefined,
      },
      {
        question: 'AI Gen Question',
        category: 'Technical',
        difficulty: 'Easy',
        relevance: 'Gap analysis',
        confidence: 0.88,
        sources: [],
        sampleAnswer: 'sample 5',
        interviewerIntent: 'intent 5',
        tips: 'tips 5',
        origin: 'ai_generated',
        reasoning: 'Missing skill',
      },
    ]);
  });

  it('returns an empty array for invalid or empty input', () => {
    expect(service.verify([])).toEqual([]);
    expect(service.verify(null as unknown as [])).toEqual([]);
  });
});
