import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const googleGenAIMocks = vi.hoisted(() => {
  const generateContentMock = vi.fn();
  class GoogleGenAIConstructorMock {
    models = {
      generateContent: generateContentMock,
    };

    constructor(_options?: unknown) {
      // Empty constructor for mocking GoogleGenAI
    }
  }

  return {
    generateContentMock,
    googleGenAIConstructorMock: GoogleGenAIConstructorMock,
  };
});

vi.mock('@google/genai', () => ({
  GoogleGenAI: googleGenAIMocks.googleGenAIConstructorMock,
}));

import { GeminiSearchProvider } from '../app/ai/interview-preparation/retrieval/gemini-search-provider.service';

describe('GeminiSearchProvider', () => {
  let provider: GeminiSearchProvider;
  let configService: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    configService = {
      get: vi.fn(),
    };

    googleGenAIMocks.generateContentMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiSearchProvider,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    provider = module.get(GeminiSearchProvider);
  });

  it('returns structured and cleaned questions from Gemini search and extract', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') {
        return 'gemini-test-key';
      }
      if (key === 'GEMINI_MAIN_MODEL') {
        return 'gemini-test-model';
      }
      return undefined;
    });

    googleGenAIMocks.generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify([
        {
          question: 'What is dependency injection?',
          category: 'Technical',
          difficulty: 'Medium',
          relevance: 'Candidate lists NestJS.',
          confidence: 0.9,
          sourceTitles: ['NestJS Docs'],
        },
        {
          // duplicate question to be removed
          question: ' What is dependency injection? ',
          category: 'Technical',
          difficulty: 'Medium',
          relevance: 'Duplicated info',
          confidence: 0.9,
          sourceTitles: [],
        },
      ]),
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              {
                web: {
                  title: 'NestJS Docs',
                  uri: 'https://docs.nestjs.com',
                },
              },
            ],
          },
        },
      ],
    });

    const results = await provider.searchAndExtract(
      'Google',
      'Software Engineer',
      'Develop things in NestJS',
      ['nestjs interview questions']
    );

    expect(googleGenAIMocks.generateContentMock).toHaveBeenCalledTimes(1);
    expect(results).toEqual([
      {
        question: 'What is dependency injection?',
        category: 'Technical',
        difficulty: 'Medium',
        relevance: 'Candidate lists NestJS.',
        confidence: 0.9,
        sources: [
          {
            title: 'NestJS Docs',
            url: 'https://docs.nestjs.com',
          },
        ],
      },
    ]);
  });

  it('throws when the API key is missing', async () => {
    configService.get.mockReturnValue(undefined);

    await expect(
      provider.searchAndExtract('Google', 'SWE', 'Desc', ['q'])
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps Gemini API failures to ServiceUnavailableException', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') {
        return 'gemini-test-key';
      }
      return undefined;
    });

    googleGenAIMocks.generateContentMock.mockRejectedValueOnce(
      new Error('Rate limit exceeded')
    );

    await expect(
      provider.searchAndExtract('Google', 'SWE', 'Desc', ['q'])
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
