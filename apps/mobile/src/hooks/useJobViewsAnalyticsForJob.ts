import { useQuery } from '@tanstack/react-query';
import { getJobViewsAnalyticsForJob } from '../api/analytics';
import type { JobViewsAnalyticsResponse } from '../types/analytics';

export function useJobViewsAnalyticsForJob(
  jobId: number | null,
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month'
) {
  return useQuery<JobViewsAnalyticsResponse>({
    queryKey: [
      'job-views-analytics-for-job',
      jobId,
      startDate.toISOString(),
      endDate.toISOString(),
      groupBy,
    ],
    queryFn: ({ signal }) =>
      getJobViewsAnalyticsForJob(jobId!, startDate, endDate, groupBy, { signal }),
    enabled: jobId !== null && !Number.isNaN(jobId),
  });
}
