import { Injectable } from '@nestjs/common';
import { InterviewQuestion } from '../dto/interview-question.model.js';
import { GroupedQuestions } from '../dto/public-question.model.js';

@Injectable()
export class QuestionRankerService {
  rank(verifiedQuestions: InterviewQuestion[]): GroupedQuestions {
    const easy: InterviewQuestion[] = [];
    const medium: InterviewQuestion[] = [];
    const hard: InterviewQuestion[] = [];

    if (!Array.isArray(verifiedQuestions)) {
      return { easy, medium, hard };
    }

    // 1. Group questions by difficulty
    for (const q of verifiedQuestions) {
      if (q.difficulty === 'Easy') {
        easy.push(q);
      } else if (q.difficulty === 'Hard') {
        hard.push(q);
      } else {
        medium.push(q);
      }
    }

    // 2. Sort each group by confidence (higher is first)
    const sortByConfidence = (arr: InterviewQuestion[]) => {
      return arr.sort((a, b) => b.confidence - a.confidence);
    };

    const sortedEasy = sortByConfidence(easy);
    const sortedMedium = sortByConfidence(medium);
    const sortedHard = sortByConfidence(hard);

    // 3. Select top 3 from each difficulty level, fallback if needed
    // Keep it simple and direct: take top 3 from each.
    // If a group has fewer than 3, we just return all of them.
    const finalEasy = sortedEasy.slice(0, 3);
    const finalMedium = sortedMedium.slice(0, 3);
    const finalHard = sortedHard.slice(0, 3);

    return {
      easy: finalEasy.map((q) => this.mapToPublic(q)),
      medium: finalMedium.map((q) => this.mapToPublic(q)),
      hard: finalHard.map((q) => this.mapToPublic(q)),
    };
  }

  private mapToPublic(q: InterviewQuestion) {
    return {
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      relevance: q.relevance,
      confidence: q.confidence,
      sources: q.sources,
      sampleAnswer: q.sampleAnswer,
      interviewerIntent: q.interviewerIntent,
      tips: q.tips,
      origin: q.origin,
      reasoning: q.reasoning,
    };
  }
}
