import { InterviewQuestion } from '../dto/interview-question.model.js';
import { InterviewContext } from '../application/interview-context.model.js';

export interface SearchProvider {
  searchAndExtract(
    context: InterviewContext,
    queries: string[]
  ): Promise<InterviewQuestion[]>;
}
