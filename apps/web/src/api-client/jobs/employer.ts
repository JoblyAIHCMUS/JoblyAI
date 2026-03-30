import axios from 'axios';
import {
  CreateJobPayload,
  JobPosting,
  UpdateJobPayload,
  JobCategory,
  PaginatedJobsResponse,
} from '@/api-client/jobs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Get all job categories
 * No authentication required
 */
export async function getCategories(): Promise<JobCategory[]> {
  const response = await axios.get<JobCategory[]>(
    `${API_BASE_URL}/api/jobs/categories`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}

/**
 * Create a new job posting
 * Requires authentication and employer role
 */
export async function createJobPosting(
  payload: CreateJobPayload
): Promise<JobPosting> {
  const response = await axios.post<JobPosting>(
    `${API_BASE_URL}/api/jobs`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}

/**
 * Update an existing job posting
 * Requires authentication and ownership (employer/admin)
 */
export async function updateJobPosting(
  id: number,
  payload: UpdateJobPayload
): Promise<JobPosting> {
  const response = await axios.patch<JobPosting>(
    `${API_BASE_URL}/api/jobs/${id}`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}

/**
 * Delete a job posting
 * Requires authentication and ownership (employer/admin)
 */
export async function deleteJobPosting(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/api/jobs/${id}`, {
    withCredentials: true,
  });
}

/**
 * List jobs posted by the current user (employer)
 * Requires authentication
 */
export async function listEmployerJobs(
  userId: string,
  page = 1,
  pageSize = 10
): Promise<PaginatedJobsResponse> {
  const response = await axios.get<PaginatedJobsResponse>(
    `${API_BASE_URL}/api/jobs/user/${userId}`,
    {
      params: {
        page,
        pageSize,
      },
      withCredentials: true,
    }
  );
  return response.data;
}
