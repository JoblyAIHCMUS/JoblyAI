import { useCallback, useState } from 'react';
import { listEmployerApplications } from '../api/application';
import { EmployerApplicationsQuery, PaginatedApplicationsResponse } from '../types/application';

export function useListEmployerApplications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<PaginatedApplicationsResponse | null>(null);

  const fetchApplications = useCallback(async (query?: EmployerApplicationsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listEmployerApplications(query);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchApplications, loading, error, data };
}
