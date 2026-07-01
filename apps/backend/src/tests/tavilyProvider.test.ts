import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TavilyProvider } from '../app/ai/interview-preparation/retrieval/tavily-provider.service';

describe('TavilyProvider', () => {
  let provider: TavilyProvider;
  let configService: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    configService = {
      get: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TavilyProvider,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    provider = module.get(TavilyProvider);
    vi.restoreAllMocks();
  });

  it('returns a flat array of normalized documents', async () => {
    configService.get.mockReturnValue('tvly-test-key');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          results: [
            {
              title: 'Result 1',
              url: 'https://example.com/1',
              content: 'First content',
              score: 0.92,
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ results: [] }),
      } as Response);

    const results = await provider.search(['first query', 'second query']);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results).toEqual([
      {
        title: 'Result 1',
        url: 'https://example.com/1',
        content: 'First content',
        score: 0.92,
        source: 'tavily',
        metadata: {
          query: 'first query',
          favicon: undefined,
          images: undefined,
        },
      },
    ]);
  });

  it('throws when the api key is missing', async () => {
    configService.get.mockReturnValue(undefined);

    await expect(provider.search(['q'])).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps rate limit responses to a service unavailable error', async () => {
    configService.get.mockReturnValue('tvly-test-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({
        detail: {
          error: 'Please reduce rate of requests.',
        },
      }),
    } as Response);

    await expect(provider.search(['q'])).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});