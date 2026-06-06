import axios from 'axios';
import {
  JobPosting,
  ListJobsQuery,
  PaginatedJobsResponse,
  PopularJobCategory,
} from '@/api-client/jobs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * List paginated jobs with optional search and filtering
 * Public endpoint - no authentication required
 */
export async function listJobs(
  query?: ListJobsQuery,
  options?: { signal?: AbortSignal }
): Promise<PaginatedJobsResponse> {
  const response = await axios.get<PaginatedJobsResponse>(
    `${API_BASE_URL}/api/jobs`,
    {
      params: query,
      signal: options?.signal,
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
  const response = await axios.get<JobPosting>(
    `${API_BASE_URL}/api/jobs/${id}`,
    {
      withCredentials: true,
    }
  );
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

/**
 * Get similar/related jobs based on job ID, company ID, or location
 * Public endpoint - no authentication required
 */
export async function getSimilarJobs(params: {
  jobId?: number;
  companyId?: number;
  location?: string;
  limit?: number;
}): Promise<JobPosting[]> {
  const response = await axios.get<JobPosting[]>(
    `${API_BASE_URL}/api/jobs/similar`,
    {
      params,
      withCredentials: true,
    }
  );
  return response.data;
}

/**
 * Get popular job categories with job counts
 * Public endpoint - no authentication required
 */
export async function getPopularJobCategories(
  limit = 8
): Promise<PopularJobCategory[]> {
  const response = await axios.get<PopularJobCategory[]>(
    `${API_BASE_URL}/api/jobs/categories/popular`,
    {
      params: { limit },
      withCredentials: true,
    }
  );
  return response.data;
}
