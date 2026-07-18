import { Injectable } from '@nestjs/common';
import { InterviewQuestion } from '../dto/interview-question.model.js';

@Injectable()
export class QuestionRankerService {
  rank(verifiedQuestions: InterviewQuestion[]): InterviewQuestion[] {
    if (!Array.isArray(verifiedQuestions) || verifiedQuestions.length === 0) {
      return [];
    }

    const ranked = [...verifiedQuestions].sort((a, b) => {
      // 1. Confidence (higher is sorted first)
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }

      // 2. Difficulty (Hard > Medium > Easy)
      if (a.difficulty !== b.difficulty) {
        return (
          this.getDifficultyScore(b.difficulty) -
          this.getDifficultyScore(a.difficulty)
        );
      }

      // 3. Question text
      return a.question.localeCompare(b.question);
    });

    return ranked;
  }

  private getDifficultyScore(difficulty: 'Easy' | 'Medium' | 'Hard'): number {
    switch (difficulty) {
      case 'Hard':
        return 3;
      case 'Medium':
        return 2;
      case 'Easy':
      default:
        return 1;
    }
  }
}
