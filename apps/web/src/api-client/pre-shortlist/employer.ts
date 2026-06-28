// apps/web/src/api-client/pre-shortlist/employer.ts

import apiClient from '@/lib/api';
import {
  type GenerateQuestionsRequest,
  type GenerateQuestionsResponse,
  type PreShortlistApplicationView,
  type PreShortlistQuestionsForJobView,
  type PreShortlistStatusView,
} from './types';

export async function generatePreShortlistQuestions(
  payload: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> {
  const response = await apiClient.post<GenerateQuestionsResponse>(
    '/jobs/pre-shortlist/generate-questions',
    payload
  );
  return response.data;
}

export async function getPreShortlistQuestionsForJob(
  jobId: number
): Promise<PreShortlistQuestionsForJobView> {
  const response = await apiClient.get<PreShortlistQuestionsForJobView>(
    `/jobs/pre-shortlist/${jobId}`
  );
  return response.data;
}

export async function getPreShortlistForApplication(
  applicationId: number
): Promise<PreShortlistApplicationView> {
  const response = await apiClient.get<PreShortlistApplicationView>(
    `/applications/${applicationId}/pre-shortlist`
  );
  return response.data;
}

export async function getPreShortlistStatus(
  applicationId: number
): Promise<PreShortlistStatusView> {
  const response = await apiClient.get<PreShortlistStatusView>(
    `/applications/${applicationId}/pre-shortlist/status`
  );
  return response.data;
}

export async function retryPreShortlistEvaluation(
  applicationId: number
): Promise<{ ok: true }> {
  const response = await apiClient.post<{ ok: true }>(
    `/applications/${applicationId}/pre-shortlist/retry`
  );
  return response.data;
}
