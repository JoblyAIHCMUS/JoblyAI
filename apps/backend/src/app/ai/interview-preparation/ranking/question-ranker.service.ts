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
        rankingScore: this.calculateScore(verifiedQuestion),
      }))
      .sort((left, right) => right.rankingScore - left.rankingScore);
  }

  private calculateScore(verifiedQuestion: VerifiedQuestion): number {
    const evidenceComponent = verifiedQuestion.evidenceCount * 1000;
    const evidenceLevelComponent = this.getEvidenceLevelScore(
      verifiedQuestion.evidenceLevel
    );

    return evidenceComponent + evidenceLevelComponent;
  }
  /**
  Evidence level is derived from the number of independent sources.
  */
  private getEvidenceLevelScore(
    evidenceLevel: VerifiedQuestion['evidenceLevel']
  ): number {
    switch (evidenceLevel) {
      case 'very_high':
        return 95;
      case 'high':
        return 90;
      case 'moderate':
        return 75;
      case 'low':
      default:
        return 60;
    }
  }
}