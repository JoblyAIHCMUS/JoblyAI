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
import {
  DEFAULT_SOURCES_FILTER_CONFIG,
  SourcesFilterConfig,
} from '../config/sources-filter.config.js';

interface RawSourceItem {
  title?: string | null;
  url?: string | null;
}

interface RawQuestionItem {
  question?: string | null;
  category?: string | null;
  difficulty?: string | null;
  relevance?: string | null;
  confidence?: number | null;
  sampleAnswer?: string | null;
  interviewerIntent?: string | null;
  tips?: string | null;
  sources?: RawSourceItem[];
}

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

      const parsed = JSON.parse(text) as unknown[];

      return this.validateAndCleanQuestions(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Gemini Search and Extract failed: ${message}`);
      throw new ServiceUnavailableException(
        `Gemini Search and Extract failed: ${message}`
      );
    }
  }

  private getModel(): string {
    return (
      this.configService.get<string>('GEMINI_MAIN_MODEL')?.trim() ||
      'gemini-3.5-flash'
    );
  }

  public getSourceRulesConfig(): SourcesFilterConfig {
    const envWhitelistStr = this.configService.get<string>(
      'INTERVIEW_WHITELIST_DOMAINS'
    );
    const envBlacklistStr = this.configService.get<string>(
      'INTERVIEW_BLACKLIST_DOMAINS'
    );

    const whitelist = envWhitelistStr
      ? envWhitelistStr
          .split(',')
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean)
      : DEFAULT_SOURCES_FILTER_CONFIG.whitelist;

    const blacklist = envBlacklistStr
      ? envBlacklistStr
          .split(',')
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean)
      : DEFAULT_SOURCES_FILTER_CONFIG.blacklist;

    return { whitelist, blacklist };
  }

  private buildPrompt(context: InterviewContext, queries: string[]): string {
    const { whitelist, blacklist } = this.getSourceRulesConfig();

    const whitelistPrompt =
      whitelist.length > 0
        ? `STRICT WHITELIST SOURCES (You MUST search and only retrieve interview questions from web sources matching these allowed domains):\n${whitelist
            .map((domain) => `- ${domain}`)
            .join('\n')}`
        : '';

    const blacklistPrompt =
      blacklist.length > 0
        ? `STRICT BLACKLIST SOURCES (Do NOT search, use, or reference content from these blocked domains under any circumstances):\n${blacklist
            .map((domain) => `- ${domain}`)
            .join('\n')}`
        : '';

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

2. Source Domain Constraints:
${whitelistPrompt}
${blacklistPrompt}

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
    questions: unknown[]
  ): Promise<InterviewQuestion[]> {
    if (!Array.isArray(questions)) {
      return Promise.resolve([]);
    }

    const { whitelist, blacklist } = this.getSourceRulesConfig();
    const seenQuestions = new Set<string>();
    const cleaned: InterviewQuestion[] = [];

    for (const item of questions) {
      if (!item || typeof item !== 'object') continue;
      const q = item as RawQuestionItem;
      const questionText = this.cleanText(q.question);
      if (!questionText) continue;

      const normQuestion = questionText.toLowerCase();
      if (seenQuestions.has(normQuestion)) continue;
      seenQuestions.add(normQuestion);

      const difficulty =
        typeof q.difficulty === 'string' &&
        ['Easy', 'Medium', 'Hard'].includes(q.difficulty)
          ? (q.difficulty as 'Easy' | 'Medium' | 'Hard')
          : 'Medium';

      const confidence = typeof q.confidence === 'number' ? q.confidence : 0;

      const rawSources = Array.isArray(q.sources)
        ? q.sources
            .map((s: RawSourceItem) => ({
              title: this.cleanText(s?.title) ?? 'Google Search',
              url: this.cleanText(s?.url) ?? 'https://google.com',
            }))
            .filter((s: { title: string; url: string }) => {
              if (!s.url) return false;
              try {
                const parsed = new URL(s.url);
                if (
                  parsed.protocol !== 'http:' &&
                  parsed.protocol !== 'https:'
                ) {
                  return false;
                }

                const hostname = parsed.hostname.toLowerCase();

                // Check blacklist: reject if hostname matches any blacklisted domain
                if (
                  blacklist.length > 0 &&
                  this.isDomainMatch(hostname, blacklist)
                ) {
                  return false;
                }

                // Check whitelist: if whitelist is specified, host must match a whitelisted domain
                if (
                  whitelist.length > 0 &&
                  !this.isDomainMatch(hostname, whitelist)
                ) {
                  return false;
                }

                return true;
              } catch {
                return false;
              }
            })
        : [];

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

  private isDomainMatch(hostname: string, domainList: string[]): boolean {
    return domainList.some((domain) => {
      const normDomain = domain.trim().toLowerCase();
      if (!normDomain) return false;
      return hostname === normDomain || hostname.endsWith('.' + normDomain);
    });
  }

  private cleanText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}

