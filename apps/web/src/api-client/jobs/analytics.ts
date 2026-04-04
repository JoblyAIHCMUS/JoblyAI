import axios from 'axios';

export interface JobViewAnalytics {
  period: string;
  jobId: number;
  viewCount: number;
}

export interface JobApplicationAnalytics {
  period: string;
  applicationCount: number;
  approvedCount: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Get job view analytics for the current employer
 * Shows number of views per job per time period
 * Requires authentication
 */
export async function getJobViewsAnalytics(
  startDate?: Date,
  endDate?: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<JobViewAnalytics[]> {
  const params = new URLSearchParams();
  if (startDate)
    params.append('startDate', startDate.toISOString().split('T')[0]);
  if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
  params.append('groupBy', groupBy);

  const response = await axios.get<JobViewAnalytics[]>(
    `${API_BASE_URL}/api/jobs/analytics/views?${params.toString()}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

/**
 * Get job application analytics for the current employer
 * Shows number of applications and approved applications per time period
 * Requires authentication
 */
export async function getJobApplicationsAnalytics(
  startDate?: Date,
  endDate?: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<JobApplicationAnalytics[]> {
  const params = new URLSearchParams();
  if (startDate)
    params.append('startDate', startDate.toISOString().split('T')[0]);
  if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
  params.append('groupBy', groupBy);

  const response = await axios.get<JobApplicationAnalytics[]>(
    `${API_BASE_URL}/api/jobs/analytics/applications?${params.toString()}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}
