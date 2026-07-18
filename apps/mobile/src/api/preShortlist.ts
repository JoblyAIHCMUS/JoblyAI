import { apiClient } from './config';

export type PreShortlistSuggestion = 'STRONG' | 'MAYBE' | 'NO';

export type PreShortlistEvaluationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type PreShortlistApplicationStatus =
  | 'APPLIED'
  | 'PRE_SHORTLIST_PENDING'
  | 'PRE_SHORTLIST_SUBMITTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

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
  status: PreShortlistApplicationStatus;
  threshold: number;
  questions: PreShortlistQuestionView[];
  answers: PreShortlistAnswerView[];
  overall: PreShortlistOverallView | null;
  preShortlistStatus: PreShortlistEvaluationStatus | null;
  preShortlistError: string | null;
}

export interface PreShortlistStatusView {
  status: PreShortlistApplicationStatus;
  answers: {
    questionId: string;
    hasEvaluation: boolean;
  }[];
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

/**
 * Fetch the full pre-shortlist view for an application: questions, the
 * candidate's existing answers, evaluation status, and overall suggestion.
 * Mirrors apps/web/src/api-client/pre-shortlist/candidate.ts::getCandidatePreShortlist.
 */
export async function getCandidatePreShortlist(
  applicationId: number
): Promise<PreShortlistApplicationView> {
  const response = await apiClient.get<PreShortlistApplicationView>(
    `/applications/${applicationId}/pre-shortlist`
  );
  return response.data;
}

/**
 * Submit the candidate's answers to all pre-shortlist questions.
 * Each answer must be 20-2000 characters (enforced server-side by
 * apps/backend/src/app/pre-shortlist/dto/submit-answers.dto.ts).
 * On success the application status flips to PRE_SHORTLIST_SUBMITTED.
 */
export async function submitPreShortlistAnswers(
  applicationId: number,
  payload: SubmitAnswersRequest
): Promise<SubmitAnswersResponse> {
  const response = await apiClient.post<SubmitAnswersResponse>(
    `/applications/${applicationId}/pre-shortlist/answers`,
    payload
  );
  return response.data;
}

/**
 * Lightweight status check: just the application status + per-question
 * evaluation flags. Used by the candidate to poll whether the AI
 * evaluation has finished. Mirrors the web's getCandidatePreShortlistStatus.
 */
export async function getCandidatePreShortlistStatus(
  applicationId: number
): Promise<PreShortlistStatusView> {
  const response = await apiClient.get<PreShortlistStatusView>(
    `/applications/${applicationId}/pre-shortlist/status`
  );
  return response.data;
}
