import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { InterviewQuestion } from '../dto/interview-question.model.js';
import { SearchProvider } from './search-provider.interface.js';
import { InterviewContext } from '../application/interview-context.model.js';

@Injectable()
export class GeminiSearchProvider implements SearchProvider {
  private readonly client: GoogleGenAI;
  private readonly logger = new Logger(GeminiSearchProvider.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      this.logger.error(
        'GEMINI_API_KEY is not defined in environment variables'
      );
    }
    this.client = new GoogleGenAI({
      apiKey: apiKey || '',
    });
  }

  async searchAndExtract(
    context: InterviewContext,
    queries: string[]
  ): Promise<InterviewQuestion[]> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured');
    }

    const model = this.getModel();
    const prompt = this.buildPrompt(context, queries);

    try {
      this.logger.log(
        `Calling Gemini API (${model}) with Google Search Tool...`
      );
      const response = await this.client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'ARRAY',
            description:
              'List of real interview questions extracted from web search results',
            items: {
              type: 'OBJECT',
              properties: {
                question: {
                  type: 'STRING',
                  description: 'The text of the interview question',
                },
                category: {
                  type: 'STRING',
                  description:
                    'The category or topic of the question (e.g. Technical, Behavioral)',
                },
                difficulty: {
                  type: 'STRING',
                  description: 'The difficulty level of the question',
                  enum: ['Easy', 'Medium', 'Hard'],
                },
                relevance: {
                  type: 'STRING',
                  description:
                    'Explanation of why this question is highly relevant to this specific company/job profile',
                },
                confidence: {
                  type: 'NUMBER',
                  description:
                    'A confidence score between 0.0 and 1.0 representing how reliable and relevant the question is based on the search sources',
                },
                sampleAnswer: {
                  type: 'STRING',
                  description:
                    'A model answer that the candidate should strive for',
                },
                interviewerIntent: {
                  type: 'STRING',
                  description:
                    'The psychological or professional reason why an interviewer asks this question',
                },
                tips: {
                  type: 'STRING',
                  description:
                    'Practical advice on how to structure the answer or what keywords/actions to highlight',
                },
                origin: {
                  type: 'STRING',
                  enum: ['web_search'],
                  description: 'Must be web_search',
                },
                sources: {
                  type: 'ARRAY',
                  description:
                    'List of source webpages where this specific question was found',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: {
                        type: 'STRING',
                        description: 'Title of the webpage',
                      },
                      url: {
                        type: 'STRING',
                        description: 'Exact URL of the webpage',
                      },
                    },
                    required: ['title', 'url'],
                  },
                },
              },
              required: [
                'question',
                'category',
                'difficulty',
                'relevance',
                'confidence',
                'sampleAnswer',
                'interviewerIntent',
                'tips',
                'origin',
                'sources',
              ],
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(text) as any[];

      return this.validateAndCleanQuestions(parsed);
    } catch (error: any) {
      this.logger.error(`Gemini Search and Extract failed: ${error.message}`);
      throw new ServiceUnavailableException(
        `Gemini Search and Extract failed: ${error.message}`
      );
    }
  }

  private getModel(): string {
    return (
      this.configService.get<string>('GEMINI_MAIN_MODEL')?.trim() ||
      'gemini-3.5-flash'
    );
  }

  private buildPrompt(context: InterviewContext, queries: string[]): string {
    return `
You are an expert recruitment system and Senior Hiring Manager.
Your goal is to find real, actual interview questions for the following role:
- Company: ${context.company ?? 'N/A'}
- Job Title / Role: ${context.role ?? 'N/A'}
- Level: ${context.level ?? 'N/A'}
- Must-have competencies: ${context.mustHaveCompetencies.join(', ')}

To achieve this:
1. Use the Google Search tool to search for real, actual interview questions related to this company, job title, and competencies.
Here are some recommended search queries to guide your search:
${queries.map((q) => `- ${q}`).join('\n')}

2. Search multiple reliable sources (e.g. Glassdoor, LeetCode, GitHub, company blogs, interview prep websites).
3. Read the search results carefully. Make sure to note the exact titles and URLs of the webpages as returned by the Google Search tool.
4. Extract exactly 5 real, actual interview questions. Do not generate fictional or hypothetical questions.
5. Classify the difficulty level of each question strictly based on Bloom's Taxonomy:
   - "Easy": Remember & Understand (e.g. basic conceptual recall, introductory behavioral questions).
   - "Medium": Apply & Analyze (e.g. situational problem solving, technical tasks, analysis of simple scenarios).
   - "Hard": Evaluate & Create (e.g. system architecture design, complex problem solving, risk assessment, strategic decision-making).

6. For each question, provide:
    - question: The text of the interview question.
    - category: The category or topic of the question (e.g. Technical, Behavioral, Situational).
    - difficulty: The difficulty level (must be exactly "Easy", "Medium", or "Hard").
    - relevance: Explanation of why this question is highly relevant to this specific company/job profile.
    - confidence: A confidence score between 0.0 and 1.0.
    - sampleAnswer: A model answer that the candidate should strive for.
    - interviewerIntent: The professional reason why an interviewer asks this question.
    - tips: Practical advice on how to structure the answer.
    - origin: Must be "web_search".
    - sources: An array of source objects from your search results, each with:
        * title: The exact title of the webpage from Google Search results.
        * url: The exact, full URL of the webpage from Google Search results.

Ensure the final output is ONLY a valid JSON array matching the required schema. Do not include any conversational text, markdown formatting other than JSON, or fictional questions.
Language constraint: Strictly English.
`.trim();
  }

  private validateAndCleanQuestions(
    questions: any[]
  ): Promise<InterviewQuestion[]> {
    if (!Array.isArray(questions)) {
      return Promise.resolve([]);
    }

    const seenQuestions = new Set<string>();
    const cleaned: InterviewQuestion[] = [];

    for (const q of questions) {
      if (!q || typeof q !== 'object') continue;
      const questionText = this.cleanText(q.question);
      if (!questionText) continue;

      const normQuestion = questionText.toLowerCase();
      if (seenQuestions.has(normQuestion)) continue;
      seenQuestions.add(normQuestion);

      const difficulty = ['Easy', 'Medium', 'Hard'].includes(q.difficulty)
        ? (q.difficulty as 'Easy' | 'Medium' | 'Hard')
        : 'Medium';

      const confidence = typeof q.confidence === 'number' ? q.confidence : 0;

      const rawSources = Array.isArray(q.sources)
        ? q.sources
            .map((s: any) => ({
              title: this.cleanText(s?.title) ?? 'Google Search',
              url: this.cleanText(s?.url) ?? 'https://google.com',
            }))
            .filter((s: any) => {
              if (!s.url) return false;
              try {
                const parsed = new URL(s.url);
                return (
                  parsed.protocol === 'http:' || parsed.protocol === 'https:'
                );
              } catch {
                return false;
              }
            })
        : [];

      // Note: As per request, we have removed the slow sequential URL 404 checking completely (bỏ hẳn).
      let sources = rawSources;
      if (sources.length === 0) {
        sources = [
          {
            title: 'Google Search Fallback',
            url: 'https://google.com',
          },
        ];
      }

      cleaned.push({
        question: questionText,
        category: this.cleanText(q.category) ?? 'General',
        difficulty,
        relevance: this.cleanText(q.relevance) ?? '',
        confidence,
        sampleAnswer: this.cleanText(q.sampleAnswer) ?? '',
        interviewerIntent: this.cleanText(q.interviewerIntent) ?? '',
        tips: this.cleanText(q.tips) ?? '',
        origin: 'web_search',
        sources,
      });
    }

    return Promise.resolve(cleaned);
  }

  private cleanText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private async isUrlAccessible(url: string): Promise<boolean> {
    // Nếu là link redirect của Vertex AI Search Grounding, bỏ qua bước check 404
    if (url.includes('vertexaisearch.cloud.google.com')) {
      return true;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      }).catch(async () => {
        // Fallback sang GET nếu HEAD bị chặn hoặc lỗi
        return await fetch(url, {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
          signal: controller.signal,
        });
      });

      clearTimeout(timeoutId);
      return response.status !== 404;
    } catch {
      return false;
    }
  }
}
