import { apiClient } from './config';
import { PaginatedJobsResponse, JobPosting, JobStatus } from '../types/job';

export interface ApiOptions {
  signal?: AbortSignal;
}

export async function listEmployerJobsByUser(
  userId: string,
  page = 1,
  pageSize = 10,
  options?: ApiOptions
): Promise<PaginatedJobsResponse> {
  const response = await apiClient.get<PaginatedJobsResponse>(
    `/jobs/user/${userId}`,
    {
      params: { page, pageSize },
      signal: options?.signal,
    }
  );
  return response.data;
}

export async function listEmployerJobsByCompany(
  companyId: number,
  page = 1,
  pageSize = 10,
  options?: ApiOptions
): Promise<PaginatedJobsResponse> {
  const response = await apiClient.get<PaginatedJobsResponse>(
    `/jobs/company/${companyId}`,
    {
      params: { page, pageSize },
      signal: options?.signal,
    }
  );
  return response.data;
}

export async function updateJobPostingStatus(
  id: number,
  status: JobStatus
): Promise<JobPosting> {
  const response = await apiClient.patch<JobPosting>(
    `/jobs/${id}`,
    { status },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export async function deleteJobPosting(id: number): Promise<void> {
  await apiClient.delete(`/jobs/${id}`);
}
