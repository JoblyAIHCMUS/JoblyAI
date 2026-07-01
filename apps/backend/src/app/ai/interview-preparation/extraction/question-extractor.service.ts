import { Injectable } from '@nestjs/common';
import { AiProviderService } from '../../ai-provider.service';
import { SearchDocument } from '../retrieval/search-document.model.js';
import { ExtractedQuestion } from '../dto/extracted-question.model.js';
import { ExtractQuestionPromptBuilder } from '../prompts/extract-question.builder.js';

@Injectable()
export class QuestionExtractorService {
  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly promptBuilder: ExtractQuestionPromptBuilder
  ) {}

  async extract(searchDocuments: SearchDocument[]): Promise<ExtractedQuestion[]> {
    const normalizedDocuments = this.normalizeDocuments(searchDocuments);

    if (normalizedDocuments.length === 0) {
      return [];
    }

    const prompt =  this.promptBuilder.build(normalizedDocuments);
    const extractedQuestions = await this.aiProvider.generateStructuredData<
      ExtractedQuestion[]
    >(prompt);

    return this.deduplicateQuestions(extractedQuestions);
  }


  private normalizeDocuments(
    searchDocuments: SearchDocument[]
  ): Array<{
    title?: string;
    url?: string;
    content?: string;
    source?: string;
  }> {
    return searchDocuments
      .map((document) => ({
        title: this.cleanText(document.title),
        url: this.cleanText(document.url),
        content: this.cleanText(document.content),
        source: this.cleanText(document.source) ?? this.cleanText(document.title),
      }))
      .filter((document) => Boolean(document.url || document.content || document.title));
  }

  private deduplicateQuestions(
    extractedQuestions: ExtractedQuestion[] | undefined | null
  ): ExtractedQuestion[] {
    if (!Array.isArray(extractedQuestions)) {
      return [];
    }

    const seen = new Set<string>();
    const results: ExtractedQuestion[] = [];

    for (const question of extractedQuestions) {
      const normalizedQuestion = this.cleanText(question?.question)?.toLowerCase();
      const normalizedUrl = this.cleanText(question?.url)?.toLowerCase();
      const dedupeKey = `${normalizedUrl}::${normalizedQuestion}`;

      if (!normalizedQuestion || !normalizedUrl || seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      results.push({
        question: this.cleanText(question.question) ?? '',
        source: this.cleanText(question.source) ?? '',
        url: this.cleanText(question.url) ?? '',
        context: this.cleanText(question.context) ?? '',
      });
    }

    return results;
  }

  private cleanText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}