import { apiClient } from './config';
import {
  PaginatedJobsResponse,
  JobCategory,
  PopularJobCategory,
  ListJobsQuery,
  JobPosting,
  CreateJobPayload,
} from '../types/job';

export interface ApiOptions {
  signal?: AbortSignal;
}

export async function listJobs(
  params?: ListJobsQuery,
  options?: ApiOptions
): Promise<PaginatedJobsResponse> {
  const response = await apiClient.get<PaginatedJobsResponse>('/jobs', {
    params,
    signal: options?.signal,
  });
  return response.data;
}

export async function getCategories(
  options?: ApiOptions
): Promise<JobCategory[]> {
  const response = await apiClient.get<JobCategory[]>('/jobs/categories', {
    signal: options?.signal,
  });
  return response.data;
}

export async function getPopularCategories(
  limit?: number,
  options?: ApiOptions
): Promise<PopularJobCategory[]> {
  const response = await apiClient.get<PopularJobCategory[]>(
    '/jobs/categories/popular',
    {
      params: { limit },
      signal: options?.signal,
    }
  );
  return response.data;
}

export async function getJobById(
  id: number,
  options?: ApiOptions
): Promise<JobPosting> {
  const response = await apiClient.get<JobPosting>(`/jobs/${id}`, {
    signal: options?.signal,
  });
  return response.data;
}

export async function listCompanyJobs(
  companyId: number,
  page = 1,
  pageSize = 20,
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

export async function createJobPosting(
  payload: CreateJobPayload,
  options?: ApiOptions
): Promise<JobPosting> {
  const response = await apiClient.post<JobPosting>('/jobs', payload, {
    signal: options?.signal,
  });
  return response.data;
}
