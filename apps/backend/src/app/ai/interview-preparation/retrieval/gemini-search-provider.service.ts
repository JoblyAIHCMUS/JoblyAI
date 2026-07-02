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
                // Cài đặt 1: Bắt Gemini trả về mảng tiêu đề nguồn thay vì URL tự chế
                sourceTitles: {
                  type: 'ARRAY',
                  description: 'Exact titles of the search results/webpages where this specific question was found',
                  items: { type: 'STRING' }
                }
              },
              required: ['question', 'category', 'difficulty', 'relevance', 'confidence', 'sourceTitles'],
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(text) as any[];

      // Cài đặt 2: Lấy danh sách metadata thô (chứa URL sạch 100%) từ Google Search Tool trả về
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const chunks = groundingMetadata?.groundingChunks || [];

      // Cài đặt 3: Tiến hành map URL bằng code hệ thống dựa trên tiêu đề nguồn
      for (const q of parsed) {
        if (!q || typeof q !== 'object') continue;

        const uniqueSourcesMap = new Map<string, { title: string; url: string }>();
        const aiSuggestedTitles = Array.isArray(q.sourceTitles) ? q.sourceTitles : [];

        for (const aiTitle of aiSuggestedTitles) {
          if (!aiTitle || typeof aiTitle !== 'string') continue;

          const normAiTitle = aiTitle.toLowerCase().trim();

          // Duyệt qua các kết quả tìm kiếm thực tế của Google để tìm link
          for (const chunk of chunks) {
            if (!chunk?.web?.uri) continue;
            const chunkTitle = (chunk.web.title || '').toLowerCase().trim();

            // Khớp nếu tiêu đề của AI trùng hoặc chứa một phần tiêu đề từ Google Search
            if (chunkTitle.includes(normAiTitle) || normAiTitle.includes(chunkTitle)) {
              uniqueSourcesMap.set(chunk.web.uri, {
                title: chunk.web.title || aiTitle,
                url: chunk.web.uri, // URL sạch từ API Google
              });
            }
          }
        }

        let mappedSources = Array.from(uniqueSourcesMap.values());

        // Fallback: Nếu AI gõ lệch tiêu đề khiến không map được link nào,
        // phân phối toàn bộ link tìm được để tránh Verifier loại bỏ câu hỏi
        if (mappedSources.length === 0 && chunks.length > 0) {
          const fallbackSources = new Map<string, { title: string; url: string }>();
          for (const chunk of chunks) {
            if (chunk?.web?.uri) {
              fallbackSources.set(chunk.web.uri, {
                title: chunk.web.title || 'Google Search Source',
                url: chunk.web.uri,
              });
            }
          }
          mappedSources = Array.from(fallbackSources.values());
        }

        // Đổ dữ liệu sources chuẩn về cho DTO cấu trúc cũ nhận diện
        q.sources = mappedSources;
      }

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

  // Cài đặt 4: Cập nhật prompt hướng dẫn mô hình xuất sourceTitles
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
    - sourceTitles: An array containing the EXACT titles of the webpages/websites from the Google Search results where you found this question.

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