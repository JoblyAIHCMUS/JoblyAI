import { useState, useCallback } from 'react';
import {
  ListCompaniesQuery,
  PaginatedCompaniesResponse,
  listCompanies,
} from '@/api-client/company';

interface UseListCompaniesOptions {
  onSuccess?: (data: PaginatedCompaniesResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching paginated companies list with search and filtering
 */
export function useListCompanies(options?: UseListCompaniesOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PaginatedCompaniesResponse | null>(null);

  const fetchCompanies = useCallback(
    async (
      query?: ListCompaniesQuery,
      requestOptions?: { signal?: AbortSignal }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listCompanies(query, requestOptions);
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

  return { fetchCompanies, loading, error, data };
}
