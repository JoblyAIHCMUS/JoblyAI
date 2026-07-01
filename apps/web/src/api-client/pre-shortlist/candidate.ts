// apps/web/src/api-client/pre-shortlist/candidate.ts

import apiClient from '@/lib/api';
import {
  type PreShortlistApplicationView,
  type PreShortlistStatusView,
  type SubmitAnswersRequest,
  type SubmitAnswersResponse,
} from './types';

export async function getCandidatePreShortlist(
  applicationId: number
): Promise<PreShortlistApplicationView> {
  const response = await apiClient.get<PreShortlistApplicationView>(
    `/applications/${applicationId}/pre-shortlist`
  );
  return response.data;
}

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

export async function getCandidatePreShortlistStatus(
  applicationId: number
): Promise<PreShortlistStatusView> {
  const response = await apiClient.get<PreShortlistStatusView>(
    `/applications/${applicationId}/pre-shortlist/status`
  );
  return response.data;
}
