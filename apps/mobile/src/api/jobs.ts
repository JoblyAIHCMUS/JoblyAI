import { apiClient } from './config';
import { PaginatedJobsResponse, JobCategory, ListJobsQuery, JobPosting } from '../types/job';

export interface ApiOptions {
  signal?: AbortSignal;
}

export async function listJobs(params?: ListJobsQuery, options?: ApiOptions): Promise<PaginatedJobsResponse> {
  const response = await apiClient.get<PaginatedJobsResponse>('/jobs', { 
    params,
    signal: options?.signal
  });
  return response.data;
}

export async function getCategories(options?: ApiOptions): Promise<JobCategory[]> {
  const response = await apiClient.get<JobCategory[]>('/jobs/categories', {
    signal: options?.signal
  });
  return response.data;
}

export async function getJobById(id: number, options?: ApiOptions): Promise<JobPosting> {
  const response = await apiClient.get<JobPosting>(`/jobs/${id}`, {
    signal: options?.signal
  });
  return response.data;
}
