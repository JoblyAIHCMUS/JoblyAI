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
