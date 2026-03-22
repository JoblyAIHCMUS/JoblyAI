import { useState } from 'react';
import {
  EmployerApplicationsQuery,
  PaginatedApplicationsResponse,
  listEmployerApplications,
} from '@/api-client/application';

interface UseListEmployerApplicationsOptions {
  onSuccess?: (data: PaginatedApplicationsResponse) => void;
  onError?: (error: unknown) => void;
}

export function useListEmployerApplications(
  options?: UseListEmployerApplicationsOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PaginatedApplicationsResponse | null>(null);

  const fetchApplications = async (query?: EmployerApplicationsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listEmployerApplications(query);
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
  };

  return { fetchApplications, loading, error, data };
}
