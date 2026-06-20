import apiClient from '@/lib/api';
import {
  ApplicationRecord,
  EmployerApplicationsQuery,
  PaginatedApplicationsResponse,
  RejectApplicationPayload,
} from '@/api-client/application/types';

export async function listEmployerApplications(
  query?: EmployerApplicationsQuery
): Promise<PaginatedApplicationsResponse> {
  const response = await apiClient.get<PaginatedApplicationsResponse>(
    '/employers/applications',
    {
      params: query,
    }
  );
  return response.data;
}

export async function getEmployerApplicationById(
  id: number | string
): Promise<ApplicationRecord> {
  const response = await apiClient.get<ApplicationRecord>(
    `/employers/applications/${id}`
  );
  return response.data;
}

export async function shortlistEmployerApplication(
  id: number
): Promise<ApplicationRecord> {
  const response = await apiClient.patch<ApplicationRecord>(
    `/employers/applications/${id}/shortlist`,
    undefined
  );
  return response.data;
}

export async function rejectEmployerApplication(
  id: number,
  payload: RejectApplicationPayload
): Promise<ApplicationRecord> {
  const response = await apiClient.patch<ApplicationRecord>(
    `/employers/applications/${id}/reject`,
    payload
  );
  return response.data;
}

export async function moveToOfferEmployerApplication(
  id: number
): Promise<ApplicationRecord> {
  const response = await apiClient.patch<ApplicationRecord>(
    `/employers/applications/${id}/offer`,
    undefined
  );
  return response.data;
}
