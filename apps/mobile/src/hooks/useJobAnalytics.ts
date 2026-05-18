import { useCallback, useState } from 'react';
import { getJobViewsAnalytics, getJobApplicationsAnalytics } from '../api/analytics';
import { JobViewAnalytics, JobApplicationAnalytics } from '../types/analytics';

export function useJobAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [viewsData, setViewsData] = useState<JobViewAnalytics[] | null>(null);
  const [appsData, setAppsData] = useState<JobApplicationAnalytics[] | null>(null);

  const fetchAnalytics = useCallback(async (startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'day') => {
    setLoading(true);
    setError(null);
    try {
      const [views, apps] = await Promise.all([
        getJobViewsAnalytics(startDate, endDate, groupBy),
        getJobApplicationsAnalytics(startDate, endDate, groupBy)
      ]);
      setViewsData(views);
      setAppsData(apps);
      return { views, apps };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchAnalytics, loading, error, viewsData, appsData };
}
