import apiClient from '@/lib/api';

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

  const response = await apiClient.get<JobViewAnalytics[]>(
    `/jobs/analytics/views?${params.toString()}`
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

  const response = await apiClient.get<JobApplicationAnalytics[]>(
    `/jobs/analytics/applications?${params.toString()}`
  );
  return response.data;
}

export interface JobViewsAnalyticsResponse {
  totalViews: number;
  series: Array<{ period: string; viewCount: number }>;
}

/**
 * Get job view analytics for a single job.
 * Returns the all-time total and a series bucketed within [startDate, endDate].
 * Requires authentication; the caller must own the job.
 */
export async function getJobViewsAnalyticsForJob(
  jobId: number,
  startDate?: Date,
  endDate?: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<JobViewsAnalyticsResponse> {
  const params = new URLSearchParams();
  if (startDate)
    params.append('startDate', startDate.toISOString().split('T')[0]);
  if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
  params.append('groupBy', groupBy);

  const response = await apiClient.get<JobViewsAnalyticsResponse>(
    `/jobs/${jobId}/analytics/views?${params.toString()}`
  );
  return response.data;
}
