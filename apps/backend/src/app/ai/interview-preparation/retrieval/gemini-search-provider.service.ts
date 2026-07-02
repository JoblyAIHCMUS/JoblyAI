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

@Injectable()
export class GeminiSearchProvider implements SearchProvider {
  private readonly client: GoogleGenAI;
  private readonly logger = new Logger(GeminiSearchProvider.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.client = new GoogleGenAI({
      apiKey: apiKey || '',
    });
  }

  async searchAndExtract(
    companyName: string | null,
    jobTitle: string,
    jobDescription: string,
    queries: string[]
  ): Promise<InterviewQuestion[]> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured');
    }

    const model = this.getModel();
    const prompt = this.buildPrompt(companyName, jobTitle, jobDescription, queries);

    try {
      this.logger.log(`Calling Gemini API (${model}) with Google Search Tool...`);
      const response = await this.client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'ARRAY',
            description: 'List of real interview questions extracted from web search results',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING', description: 'The text of the interview question' },
                category: { type: 'STRING', description: 'The category or topic of the question (e.g. Technical, Behavioral)' },
                difficulty: {
                  type: 'STRING',
                  description: 'The difficulty level of the question',
                  enum: ['Easy', 'Medium', 'Hard'],
                },
                relevance: {
                  type: 'STRING',
                  description: 'Explanation of why this question is highly relevant to this specific company/job profile',
                },
                confidence: {
                  type: 'NUMBER',
                  description: 'A confidence score between 0.0 and 1.0 representing how reliable and relevant the question is based on the search sources',
                },
                sources: {
                  type: 'ARRAY',
                  description: 'The web sources where this question was found',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING', description: 'The title of the source website/webpage' },
                      url: { type: 'STRING', description: 'The exact URL of the source page' },
                    },
                    required: ['title', 'url'],
                  },
                },
              },
              required: ['question', 'category', 'difficulty', 'relevance', 'confidence', 'sources'],
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(text) as InterviewQuestion[];
      return this.validateAndCleanQuestions(parsed);
    } catch (error: any) {
      this.logger.error(`Gemini Search and Extract failed: ${error.message}`);
      throw new ServiceUnavailableException(`Gemini Search and Extract failed: ${error.message}`);
    }
  }

  private getModel(): string {
    return (
      this.configService.get<string>('GEMINI_MAIN_MODEL')?.trim() ||
      'gemini-2.5-flash'
    );
  }

  private buildPrompt(
    companyName: string | null,
    jobTitle: string,
    jobDescription: string,
    queries: string[]
  ): string {
    return `
You are an expert recruitment system and Senior Hiring Manager.
Your goal is to find real, actual interview questions for the following role:
- Company: ${companyName ?? 'N/A'}
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}

To achieve this:
1. Use the Google Search tool to search for real interview questions related to this company, job title, and job description.
Here are some recommended search queries to guide your search:
${queries.map((q) => `- ${q}`).join('\n')}

2. Search multiple reliable sources (e.g. Glassdoor, LeetCode, GitHub, company blogs, interview prep websites).
3. Read the search results carefully.
4. Extract only real, actual interview questions. Do not generate fictional or hypothetical questions.
5. Merge and deduplicate similar or identical questions.
6. For each question, provide:
    - question: The text of the interview question.
    - category: The category or topic of the question (e.g. Technical, Behavioral).
    - difficulty: The difficulty level (must be exactly "Easy", "Medium", or "Hard").
    - relevance: Explanation of why this question is highly relevant to this specific company/job profile.
    - confidence: A confidence score between 0.0 and 1.0.
    - sources: An array of source objects, each containing:
      * title: The title of the website/webpage where the question was found.
      * url: The exact URL of the source page.

Ensure the final output is ONLY a valid JSON array matching the required schema. Do not include any conversational text, markdown formatting other than JSON, or fictional questions.
`.trim();
  }

  private validateAndCleanQuestions(questions: any[]): InterviewQuestion[] {
    if (!Array.isArray(questions)) {
      return [];
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

      const sources = Array.isArray(q.sources)
        ? q.sources
            .map((s: any) => ({
              title: this.cleanText(s?.title) ?? 'Google Search',
              url: this.cleanText(s?.url) ?? 'https://google.com',
            }))
            .filter((s: any) => Boolean(s.url))
        : [];

      cleaned.push({
        question: questionText,
        category: this.cleanText(q.category) ?? 'General',
        difficulty,
        relevance: this.cleanText(q.relevance) ?? '',
        confidence,
        sources,
      });
    }

    return cleaned;
  }

  private cleanText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}
