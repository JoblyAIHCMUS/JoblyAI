import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiProviderService {
  private client: GoogleGenAI;
  private readonly logger = new Logger(AiProviderService.name);

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_KEY is not defined in environment variables');
    }
    this.client = new GoogleGenAI({
      apiKey: apiKey || '',
    });
  }

  private parseJsonResponse<T>(text: string): T {
    try {
      return JSON.parse(text) as T;
    } catch (parseError: any) {
      this.logger.error(
        `Failed to parse Gemini response as JSON. Error: ${parseError.message}. Content: ${text}`
      );

      // Try to fix common Gemini JSON issues (like markdown blocks)
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) ||
        text.match(/```([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          this.logger.log('Attempting to parse extracted JSON block...');
          return JSON.parse(jsonMatch[1].trim()) as T;
        } catch (retryError) {
          this.logger.error('Failed to parse extracted JSON block.');
        }
      }

      throw new Error('Invalid JSON response from AI');
    }
  }

  private cvAuditCacheName: string | null = null;

  async generateStructuredDataWithCache<T>(
    prompt: string,
    systemInstruction: string,
    cacheDisplayName: string
  ): Promise<T> {
    const modelName = process.env.GEMINI_MAIN_MODEL || 'gemini-3.5-flash';

    if (!this.cvAuditCacheName) {
      try {
        this.logger.log(
          `[Cache] Attempting to create context cache for: ${cacheDisplayName}...`
        );

        // Create an explicit cache. In case Google enforces >32k token limits, this may throw, triggering fallback.
        const cache = await this.client.caches.create({
          model: modelName,
          config: {
            displayName: cacheDisplayName,
            ttl: '300s', // 5-minute Time to Live, extended on every access
            systemInstruction: systemInstruction,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: 'Here are the official CV Audit reference documents and standards to follow for all future CV auditing requests.',
                  },
                ],
              },
            ],
          },
        });

        this.cvAuditCacheName = cache.name || null;
        this.logger.log(
          `[Cache] Explicit context cache created successfully: ${this.cvAuditCacheName}`
        );
      } catch (cacheError: any) {
        this.logger.warn(
          `[Cache] Explicit context cache creation failed: ${cacheError.message}. Defaulting to standard API calls (Implicit caching).`
        );
        this.cvAuditCacheName = null;
      }
    }

    // Try executing with explicit cache
    if (this.cvAuditCacheName) {
      try {
        this.logger.log(
          `[Cache] Generating content using explicit cache: ${this.cvAuditCacheName}`
        );
        const response = await this.client.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            cachedContent: this.cvAuditCacheName,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error('Empty response from AI cache generation');
        }

        return this.parseJsonResponse<T>(text);
      } catch (apiError: any) {
        this.logger.error(
          `[Cache] Request failed with cache: ${apiError.message}. Resetting cache and falling back to standard call.`
        );
        this.cvAuditCacheName = null;
      }
    }

    // Standard Fallback Call (uses Google's implicit infrastructure optimization)
    this.logger.log(
      `[Gemini] Executing standard content generation (Implicit caching)...`
    );
    const response = await this.client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\nUSER RESUME TO AUDIT:\n${prompt}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI');
    }

    return this.parseJsonResponse<T>(text);
  }

  async generateStructuredData<T>(prompt: string, _schema?: any): Promise<T> {
    try {
      this.logger.log(
        'Calling Gemini API (@google/genai) for structured data...'
      );

      const response = await this.client.models.generateContent({
        model: process.env.GEMINI_MAIN_MODEL || 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI');
      }

      return this.parseJsonResponse<T>(text);
    } catch (error: any) {
      this.logger.error(`Gemini API error: ${error.message}`);
      throw error;
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: process.env.GEMINI_MAIN_MODEL || 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text || '';
    } catch (error: any) {
      this.logger.error(`Gemini API text error: ${error.message}`);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use the flagship Gemini Embedding 2 model
      const result = await this.client.models.embedContent({
        model: 'gemini-embedding-2',
        contents: [
          {
            parts: [{ text }],
            role: 'user',
          },
        ],
        // Standard task types for best quality
        config: {
          taskType: 'RETRIEVAL_DOCUMENT',
          outputDimensionality: 768,
        },
      });

      if (!result.embeddings || result.embeddings.length === 0) {
        return [];
      }

      return result.embeddings[0].values || [];
    } catch (error: any) {
      this.logger.error(`Gemini Embedding 2 error: ${error.message}`);
      return [];
    }
  }

  /**
   * Batch generate embeddings for multiple texts with concurrency control
   * Returns an array of embedding vectors, one per input text
   * Failed items return empty arrays []
   */
  async generateEmbeddings(
    texts: string[],
    concurrencyLimit = 3
  ): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    this.logger.log(
      `Batch generating embeddings for ${texts.length} texts (concurrency: ${concurrencyLimit})`
    );

    const results: number[][] = Array(texts.length).fill([]);

    // Process in batches to respect concurrency limit
    for (let i = 0; i < texts.length; i += concurrencyLimit) {
      const batch = texts.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map((text, batchIndex) =>
        this.generateEmbedding(text).then((embedding) => ({
          originalIndex: i + batchIndex,
          embedding,
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ originalIndex, embedding }) => {
        results[originalIndex] = embedding;
      });
    }

    this.logger.log(
      `Batch embedding complete. Generated ${
        results.filter((e) => e.length > 0).length
      }/${texts.length} embeddings successfully`
    );

    return results;
  }
}
