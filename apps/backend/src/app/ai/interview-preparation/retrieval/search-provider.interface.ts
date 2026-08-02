import { InterviewQuestion } from '../dto/interview-question.model.js';
import { InterviewContext } from '../application/interview-context.model.js';

export interface SearchProviderOptions {
  excludeQuestions?: string[];
}

export interface SearchProvider {
  searchAndExtract(
    context: InterviewContext,
    queries: string[],
    options?: SearchProviderOptions
  ): Promise<InterviewQuestion[]>;
}

