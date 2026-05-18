import { apiClient } from './config';
import {
  PaginatedApplicationsResponse,
  EmployerApplicationsQuery,
} from '../types/application';

export async function listEmployerApplications(
  query?: EmployerApplicationsQuery
): Promise<PaginatedApplicationsResponse> {
  const response = await apiClient.get<PaginatedApplicationsResponse>(
    '/employers/applications',
    { params: query }
  );
  return response.data;
}
