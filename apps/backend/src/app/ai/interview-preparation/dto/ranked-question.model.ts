import { VerifiedQuestion } from './verified-question.model.js';

export interface RankedQuestion extends VerifiedQuestion {
  rankingScore: number;
}