import { InterviewQuestion } from '../dto/interview-question.model.js';

export interface SearchProvider {
  searchAndExtract(
    companyName: string | null,
    jobTitle: string,
    jobDescription: string,
    queries: string[]
  ): Promise<InterviewQuestion[]>;
}
