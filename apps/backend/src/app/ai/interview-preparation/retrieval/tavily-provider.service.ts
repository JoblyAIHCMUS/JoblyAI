import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchDocument } from './search-document.model.js';
import { SearchProvider } from './search-provider.interface.js';

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  raw_content?: string;
  score?: number;
  favicon?: string;
  images?: Array<{ url?: string; description?: string }>;
};

type TavilySearchResponse = {
  results?: TavilyResult[];
  detail?: { error?: string } | string;
  query?: string;
};

@Injectable()
export class TavilyProvider implements SearchProvider {
  private readonly endpoint = 'https://api.tavily.com/search';

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {}

  async search(queries: string[]): Promise<SearchDocument[]> {
    const normalizedQueries = this.uniqueQueries(queries);

    if (normalizedQueries.length === 0) {
      return [];
    }

    const apiKey = this.getApiKey();
    const settledResults = await Promise.allSettled(
      normalizedQueries.map((query) => this.searchQuery(query, apiKey))
    );

    const documents: SearchDocument[] = [];
    for (const settledResult of settledResults) {
      if (settledResult.status === 'fulfilled') {
        documents.push(...settledResult.value);
        continue;
      }

      throw settledResult.reason;
    }

    return documents;
  }

  private async searchQuery(
    query: string,
    apiKey: string
  ): Promise<SearchDocument[]> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        topic: 'general',
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
        include_images: false,
      }),
    });

    if (!response.ok) {
      throw await this.mapHttpError(response, query);
    }

    const payload = (await response.json()) as TavilySearchResponse;
    const results = Array.isArray(payload.results) ? payload.results : [];

    if (results.length === 0) {
      return [];
    }

    return results.map((result) => this.normalizeResult(result, query));
  }

  private normalizeResult(result: TavilyResult, query: string): SearchDocument {
    return {
      title: this.toText(result.title),
      url: this.toText(result.url),
      content: this.toText(result.content ?? result.raw_content),
      score: typeof result.score === 'number' ? result.score : undefined,
      source: 'tavily',
      metadata: {
        query,
        favicon: result.favicon,
        images: result.images,
      },
    };
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('TAVILY_API_KEY');

    if (!apiKey?.trim()) {
      throw new BadRequestException('TAVILY_API_KEY is not configured');
    }

    return apiKey.trim();
  }

  private uniqueQueries(queries: string[]): string[] {
    return [
      ...new Set(
        queries
          .map((query) => this.toText(query))
          .filter((query): query is string => Boolean(query))
      ),
    ];
  }

  private toText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private async mapHttpError(
    response: Response,
    query: string
  ): Promise<Error> {
    const message = await this.extractErrorMessage(response);
    const description = `Tavily search failed for query "${query}" (${
      response.status
    } ${response.statusText})${message ? `: ${message}` : ''}`;

    if (response.status === 401) {
      return new ServiceUnavailableException(
        `${description}. Check TAVILY_API_KEY.`
      );
    }

    if (
      response.status === 429 ||
      response.status === 432 ||
      response.status === 433
    ) {
      return new ServiceUnavailableException(
        `${description}. Rate limit or usage limit reached.`
      );
    }

    if (response.status >= 500) {
      return new ServiceUnavailableException(description);
    }

    return new ServiceUnavailableException(description);
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const payload = (await response.json()) as TavilySearchResponse;

      if (typeof payload.detail === 'string') {
        return payload.detail;
      }

      if (typeof payload.detail?.error === 'string') {
        return payload.detail.error;
      }
    } catch {
      // Ignore malformed error payloads and fall back to the HTTP status text.
    }

    return '';
  }
}
