import { apiClient } from './config';
import {
  CandidateApplicationsQuery,
  PaginatedCandidateApplicationsResponse,
  PaginatedApplicationsResponse,
  EmployerApplicationsQuery,
} from '../types/application';

export interface ApiOptions {
  signal?: AbortSignal;
}

export async function listEmployerApplications(
  query?: EmployerApplicationsQuery
): Promise<PaginatedApplicationsResponse> {
  const response = await apiClient.get<PaginatedApplicationsResponse>(
    '/employers/applications',
    { params: query }
  );
  return response.data;
}

export async function listCandidateApplications(
  query?: CandidateApplicationsQuery,
  options?: ApiOptions
): Promise<PaginatedCandidateApplicationsResponse> {
  const response = await apiClient.get<PaginatedCandidateApplicationsResponse>(
    '/applications',
    {
      params: query,
      signal: options?.signal,
    }
  );

  return response.data;
}

export async function withdrawCandidateApplication(
  applicationId: number
): Promise<any> {
  const response = await apiClient.patch(`/applications/${applicationId}`);
  return response.data;
}

export async function shortlistApplication(
  applicationId: string | number
): Promise<void> {
  const response = await apiClient.patch(
    `/employers/applications/${applicationId}/shortlist`
  );
  return response.data;
}

export async function rejectApplication(
  applicationId: string | number,
  feedback: string
): Promise<void> {
  const response = await apiClient.patch(
    `/employers/applications/${applicationId}/reject`,
    { feedback }
  );
  return response.data;
}

export async function moveToOfferApplication(
  applicationId: string | number
): Promise<void> {
  const response = await apiClient.patch(
    `/employers/applications/${applicationId}/offer`
  );
  return response.data;
}

export async function getEmployerApplicationById(
  id: string | number
): Promise<unknown> {
  const response = await apiClient.get(`/employers/applications/${id}`);
  return response.data;
}
