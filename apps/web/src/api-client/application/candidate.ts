import apiClient from '@/lib/api';
import {
  ApplicationRecord,
  CandidateApplicationsQuery,
  CreateApplicationPayload,
  PaginatedApplicationsResponse,
} from '@/api-client/application/types';

export async function listCandidateApplications(
  query?: CandidateApplicationsQuery
): Promise<PaginatedApplicationsResponse> {
  const response = await apiClient.get<PaginatedApplicationsResponse>(
    '/applications',
    {
      params: query,
    }
  );
  return response.data;
}

export async function getCandidateApplicationById(
  id: number
): Promise<ApplicationRecord> {
  const response = await apiClient.get<ApplicationRecord>(
    `/applications/${id}`
  );
  return response.data;
}

export async function createApplication(
  payload: CreateApplicationPayload
): Promise<ApplicationRecord> {
  const response = await apiClient.post<ApplicationRecord>(
    '/applications',
    payload
  );
  return response.data;
}

export async function withdrawCandidateApplication(
  id: number
): Promise<ApplicationRecord> {
  const response = await apiClient.patch<ApplicationRecord>(
    `/applications/${id}`,
    undefined
  );
  return response.data;
}
