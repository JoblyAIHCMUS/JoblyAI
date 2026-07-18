import { Injectable } from '@nestjs/common';
import { InterviewQuestion } from '../dto/interview-question.model.js';

@Injectable()
export class QuestionVerifierService {
  verify(questions: InterviewQuestion[]): InterviewQuestion[] {
    if (!Array.isArray(questions) || questions.length === 0) {
      return [];
    }

    const verifiedList: InterviewQuestion[] = [];

    for (const q of questions) {
      if (!q || typeof q !== 'object') {
        continue;
      }

      const questionText = this.cleanText(q.question);
      const confidence = typeof q.confidence === 'number' ? q.confidence : 0;

      // Filter: confidence must be >= 0.7, and must have a valid question
      if (!questionText || confidence < 0.7) {
        continue;
      }

      const origin =
        q.origin === 'ai_generated' ? 'ai_generated' : 'web_search';

      // Check sources: must have at least one valid source if web_search
      let validSources: { title: string; url: string }[] = [];
      if (origin === 'web_search') {
        validSources = Array.isArray(q.sources)
          ? q.sources
              .map((s: any) => ({
                title: this.cleanText(s?.title) ?? 'Google Search',
                url: this.cleanText(s?.url),
              }))
              .filter((s): s is { title: string; url: string } =>
                this.isValidUrl(s.url)
              )
          : [];

        if (validSources.length === 0) {
          continue;
        }
      }

      const category = this.cleanText(q.category) ?? 'General';
      const relevance = this.cleanText(q.relevance) ?? '';
      const difficulty = ['Easy', 'Medium', 'Hard'].includes(q.difficulty)
        ? (q.difficulty as 'Easy' | 'Medium' | 'Hard')
        : 'Medium';

      const sampleAnswer = this.cleanText(q.sampleAnswer) ?? '';
      const interviewerIntent = this.cleanText(q.interviewerIntent) ?? '';
      const tips = this.cleanText(q.tips) ?? '';
      const reasoning = this.cleanText(q.reasoning);

      verifiedList.push({
        question: questionText,
        category,
        difficulty,
        relevance,
        confidence,
        sources: validSources,
        sampleAnswer,
        interviewerIntent,
        tips,
        origin,
        reasoning,
      });
    }

    return verifiedList;
  }

  private isValidUrl(url?: string): boolean {
    if (!url) return false;

    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private cleanText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}
