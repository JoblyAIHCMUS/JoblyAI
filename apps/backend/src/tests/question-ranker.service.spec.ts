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
        sampleAnswer: 'sample c',
        interviewerIntent: 'intent c',
        tips: 'tips c',
        origin: 'web_search',
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
        sampleAnswer: 'sample a',
        interviewerIntent: 'intent a',
        tips: 'tips a',
        origin: 'web_search',
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
        sampleAnswer: 'sample b',
        interviewerIntent: 'intent b',
        tips: 'tips b',
        origin: 'web_search',
      },
    ]);

    expect(result).toEqual({
      easy: [
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
          sampleAnswer: 'sample c',
          interviewerIntent: 'intent c',
          tips: 'tips c',
          origin: 'web_search',
          reasoning: undefined,
        },
      ],
      medium: [
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
          sampleAnswer: 'sample b',
          interviewerIntent: 'intent b',
          tips: 'tips b',
          origin: 'web_search',
          reasoning: undefined,
        },
      ],
      hard: [
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
          sampleAnswer: 'sample a',
          interviewerIntent: 'intent a',
          tips: 'tips a',
          origin: 'web_search',
          reasoning: undefined,
        },
      ],
    });
  });

  it('returns an empty grouped structure for invalid or empty input', () => {
    expect(service.rank([])).toEqual({ easy: [], medium: [], hard: [] });
    expect(service.rank(null as unknown as [])).toEqual({ easy: [], medium: [], hard: [] });
  });
});
