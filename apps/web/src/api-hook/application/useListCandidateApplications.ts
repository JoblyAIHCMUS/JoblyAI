import { useState } from 'react';
import {
  CandidateApplicationsQuery,
  PaginatedApplicationsResponse,
  listCandidateApplications,
} from '@/api-client/application';

interface UseListCandidateApplicationsOptions {
  onSuccess?: (data: PaginatedApplicationsResponse) => void;
  onError?: (error: unknown) => void;
}

export function useListCandidateApplications(
  options?: UseListCandidateApplicationsOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PaginatedApplicationsResponse | null>(null);

  const fetchApplications = async (query?: CandidateApplicationsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listCandidateApplications(query);
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
