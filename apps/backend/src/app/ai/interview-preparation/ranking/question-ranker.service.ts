import { Injectable } from '@nestjs/common';
import { RankedQuestion } from '../dto/ranked-question.model.js';
import { VerifiedQuestion } from '../dto/verified-question.model.js';

@Injectable()
export class QuestionRankerService {
  rank(verifiedQuestions: VerifiedQuestion[]): RankedQuestion[] {
    if (!Array.isArray(verifiedQuestions) || verifiedQuestions.length === 0) {
      return [];
    }

    return verifiedQuestions
      .map((verifiedQuestion) => ({
        ...verifiedQuestion,
        score: this.calculateScore(verifiedQuestion),
      }))
      .sort((left, right) => right.score - left.score);
  }

  private calculateScore(verifiedQuestion: VerifiedQuestion): number {
    const evidenceComponent = verifiedQuestion.evidenceCount * 1000;
    const confidenceComponent = Math.round(verifiedQuestion.confidence * 100);

    return evidenceComponent + confidenceComponent;
  }
}