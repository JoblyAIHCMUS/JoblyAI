import axios from 'axios';
import {
  CreateJobPayload,
  JobPosting,
  UpdateJobPayload,
} from '@/api-client/jobs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Create a new job posting
 * Requires authentication and employer role
 */
export async function createJobPosting(
  payload: CreateJobPayload
): Promise<JobPosting> {
  const response = await axios.post<JobPosting>(
    `${API_BASE_URL}/jobs`,
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
    `${API_BASE_URL}/jobs/${id}`,
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
  await axios.delete(`${API_BASE_URL}/jobs/${id}`, {
    withCredentials: true,
  });
}

/**
 * List jobs posted by the current user (employer)
 * Requires authentication
 */
export async function listEmployerJobs(userId: string): Promise<JobPosting[]> {
  const response = await axios.get<JobPosting[]>(
    `${API_BASE_URL}/jobs/user/${userId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}
