import { describe, expect, it } from 'vitest';
import { QuestionRankerService } from '../app/ai/interview-preparation/ranking/question-ranker.service.js';

describe('QuestionRankerService', () => {
  const service = new QuestionRankerService();

  it('calculates a deterministic ranking score using confidence, difficulty, and sources and sorts questions', () => {
    const result = service.rank([
      {
        question: 'Question C',
        category: 'General',
        difficulty: 'Easy',
        relevance: 'easy relevance',
        confidence: 0.7,
        sources: [
          { title: 's1', url: 'url1' },
          { title: 's2', url: 'url2' },
        ],
      },
      {
        question: 'Question A',
        category: 'Technical',
        difficulty: 'Hard',
        relevance: 'hard relevance',
        confidence: 0.9,
        sources: [
          { title: 's1', url: 'url1' },
          { title: 's2', url: 'url2' },
          { title: 's3', url: 'url3' },
          { title: 's4', url: 'url4' },
        ],
      },
      {
        question: 'Question B',
        category: 'Behavioral',
        difficulty: 'Medium',
        relevance: 'medium relevance',
        confidence: 0.8,
        sources: [
          { title: 's1', url: 'url1' },
          { title: 's2', url: 'url2' },
        ],
      },
    ]);

    expect(result).toEqual([
      {
        question: 'Question A',
        category: 'Technical',
        difficulty: 'Hard',
        relevance: 'hard relevance',
        confidence: 0.9,
        sources: [
          { title: 's1', url: 'url1' },
          { title: 's2', url: 'url2' },
          { title: 's3', url: 'url3' },
          { title: 's4', url: 'url4' },
        ],
      },
      {
        question: 'Question B',
        category: 'Behavioral',
        difficulty: 'Medium',
        relevance: 'medium relevance',
        confidence: 0.8,
        sources: [
          { title: 's1', url: 'url1' },
          { title: 's2', url: 'url2' },
        ],
      },
      {
        question: 'Question C',
        category: 'General',
        difficulty: 'Easy',
        relevance: 'easy relevance',
        confidence: 0.7,
        sources: [
          { title: 's1', url: 'url1' },
          { title: 's2', url: 'url2' },
        ],
      },
    ]);
  });

  it('returns an empty array for invalid or empty input', () => {
    expect(service.rank([])).toEqual([]);
    expect(service.rank(null as unknown as [])).toEqual([]);
  });
});
