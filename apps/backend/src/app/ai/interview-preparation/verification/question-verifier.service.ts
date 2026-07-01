import { Injectable } from '@nestjs/common';
import { ExtractedQuestion } from '../dto/extracted-question.model.js';
import {
  EvidenceLevel,
  VerifiedQuestion,
} from '../dto/verified-question.model.js';

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

      if (normalizedContext) {
        const normalizedContextKey = normalizedContext.toLowerCase();

        if (!group.seenContexts.has(normalizedContextKey)) {
          group.seenContexts.add(normalizedContextKey);
          group.contexts.push(normalizedContext);
        }
      }

      groups.set(normalizedQuestion, group);
    }

    return Array.from(groups.values()).map((group) => {
      const evidenceCount = group.sources.length;

      return {
        question: group.question,
        evidenceCount,
        evidenceLevel: this.getEvidenceLevel(evidenceCount),
        sources: group.sources,
        contexts: group.contexts,
      };
    });
  }

  private getEvidenceLevel(evidenceCount: number): EvidenceLevel {
    if (evidenceCount >= 4) {
      return 'very_high';
    }

    if (evidenceCount === 3) {
      return 'high';
    }

    if (evidenceCount === 2) {
      return 'moderate';
    }

    return 'low';
  }

  private cleanText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}