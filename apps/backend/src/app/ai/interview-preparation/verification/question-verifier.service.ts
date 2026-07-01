import { Injectable } from '@nestjs/common';
import { ExtractedQuestion } from '../dto/extracted-question.model.js';
import { VerifiedQuestion } from '../dto/verified-question.model.js';

type QuestionGroup = {
  question: string;
  sources: string[];
  contexts: string[];
  seenSources: Set<string>;
  seenContexts: Set<string>;
};

@Injectable()
export class QuestionVerifierService {
  verify(extractedQuestions: ExtractedQuestion[]): VerifiedQuestion[] {
    if (!Array.isArray(extractedQuestions) || extractedQuestions.length === 0) {
      return [];
    }

    const groups = new Map<string, QuestionGroup>();

    for (const extractedQuestion of extractedQuestions) {
      const normalizedQuestion = this.cleanText(extractedQuestion?.question)?.toLowerCase();
      const normalizedSource = this.cleanText(extractedQuestion?.url)?.toLowerCase();
      const normalizedContext = this.cleanText(extractedQuestion?.context);

      if (!normalizedQuestion || !normalizedSource) {
        continue;
      }

      const group = groups.get(normalizedQuestion) ?? {
        question: this.cleanText(extractedQuestion.question) ?? '',
        sources: [],
        contexts: [],
        seenSources: new Set<string>(),
        seenContexts: new Set<string>(),
      };

      if (group.seenSources.has(normalizedSource)) {
        continue;
      }

      group.seenSources.add(normalizedSource);
      group.sources.push(this.cleanText(extractedQuestion.url) ?? '');

      if (normalizedContext && !group.seenContexts.has(normalizedContext.toLowerCase())) {
        group.seenContexts.add(normalizedContext.toLowerCase());
        group.contexts.push(normalizedContext);
      }

      groups.set(normalizedQuestion, group);
    }

    return Array.from(groups.values()).map((group) => {
      const evidenceCount = group.sources.length;

      return {
        question: group.question,
        evidenceCount,
        confidence: this.getConfidence(evidenceCount),
        sources: group.sources,
        contexts: group.contexts,
      };
    });
  }

  private getConfidence(evidenceCount: number): number {
    if (evidenceCount >= 4) {
      return 0.95;
    }

    if (evidenceCount === 3) {
      return 0.9;
    }

    if (evidenceCount === 2) {
      return 0.75;
    }

    return 0.6;
  }

  private cleanText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}