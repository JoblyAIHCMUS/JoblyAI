// apps/web/src/api-client/pre-shortlist/types.ts

export type PreShortlistSuggestion = 'STRONG' | 'MAYBE' | 'NO';

export type PreShortlistEvaluationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface PreShortlistQuestionView {
  id: string;
  order: number;
  question: string;
  expectedAnswer?: string;
}

export interface PreShortlistAnswerView {
  id: string;
  questionId: string;
  answer: string;
  llmComment: string | null;
}

export interface PreShortlistOverallView {
  comment: string;
  suggestion: PreShortlistSuggestion;
}

export interface PreShortlistApplicationView {
  status:
    | 'APPLIED'
    | 'PRE_SHORTLIST_PENDING'
    | 'PRE_SHORTLIST_SUBMITTED'
    | 'INTERVIEW'
    | 'OFFER'
    | 'REJECTED'
    | 'WITHDRAWN';
  threshold: number;
  questions: PreShortlistQuestionView[];
  answers: PreShortlistAnswerView[];
  overall: PreShortlistOverallView | null;
  preShortlistStatus: PreShortlistEvaluationStatus | null;
  preShortlistError: string | null;
}

export interface PreShortlistStatusView {
  status: PreShortlistApplicationView['status'];
  answers: {
    questionId: string;
    hasEvaluation: boolean;
  }[];
}

export interface PreShortlistQuestionsForJobView {
  enabled: boolean;
  threshold: number;
  questions: PreShortlistQuestionView[];
}

export interface GenerateQuestionsRequest {
  title: string;
  description: string;
  requirements: {
    skillName: string;
    importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
    minYearsExperience: number | null;
  }[];
  count?: number;
}

export interface GenerateQuestionsResponse {
  questions: { question: string; expectedAnswer: string }[];
}

export interface SubmitAnswerInput {
  questionId: string;
  answer: string;
}

export interface SubmitAnswersRequest {
  answers: SubmitAnswerInput[];
}

export interface SubmitAnswersResponse {
  applicationId: number;
  status: 'PRE_SHORTLIST_SUBMITTED';
}
