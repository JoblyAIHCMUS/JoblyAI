import axios from 'axios';
import {
  JobPosting,
  ListJobsQuery,
  PaginatedJobsResponse,
} from '@/api-client/jobs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * List paginated jobs with optional search and filtering
 * Public endpoint - no authentication required
 */
export async function listJobs(
  query?: ListJobsQuery
): Promise<PaginatedJobsResponse> {
  const response = await axios.get<PaginatedJobsResponse>(
    `${API_BASE_URL}/api/jobs`,
    {
      params: query,
      withCredentials: true,
    }
  );
  return response.data;
}

/**
 * Get a single job by ID
 * Public endpoint - no authentication required
 */
export async function getJobById(id: number): Promise<JobPosting> {
  const response = await axios.get<JobPosting>(`${API_BASE_URL}/api/jobs/${id}`, {
    withCredentials: true,
  });
  return response.data;
}

/**
 * Get jobs by category ID
 * Public endpoint - no authentication required
 */
export async function getJobsByCategory(
  categoryId: number
): Promise<JobPosting[]> {
  const response = await axios.get<JobPosting[]>(
    `${API_BASE_URL}/api/jobs/category/${categoryId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}
