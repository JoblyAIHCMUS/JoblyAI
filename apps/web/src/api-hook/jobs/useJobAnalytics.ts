import { useCallback, useState } from 'react';
import {
  JobViewAnalytics,
  JobApplicationAnalytics,
  getJobViewsAnalytics,
  getJobApplicationsAnalytics,
} from '@/api-client/jobs';

interface UseJobAnalyticsOptions {
  onSuccess?: (data: JobViewAnalytics[] | JobApplicationAnalytics[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching job view analytics
 * Shows number of views per job per time period
 * Manual fetch - no auto-polling
 */
export function useJobViewsAnalytics(options?: UseJobAnalyticsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobViewAnalytics[] | null>(null);

  const fetchAnalytics = useCallback(
    async (
      startDate?: Date,
      endDate?: Date,
      groupBy: 'day' | 'week' | 'month' = 'day'
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getJobViewsAnalytics(startDate, endDate, groupBy);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    fetchAnalytics,
    loading,
    error,
    data,
  };
}

/**
 * Hook for fetching job application analytics
 * Shows number of applications and approved applications per time period
 * Manual fetch - no auto-polling
 */
export function useJobApplicationsAnalytics(options?: UseJobAnalyticsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobApplicationAnalytics[] | null>(null);

  const fetchAnalytics = useCallback(
    async (
      startDate?: Date,
      endDate?: Date,
      groupBy: 'day' | 'week' | 'month' = 'day'
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getJobApplicationsAnalytics(
          startDate,
          endDate,
          groupBy
        );
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    fetchAnalytics,
    loading,
    error,
    data,
  };
}
