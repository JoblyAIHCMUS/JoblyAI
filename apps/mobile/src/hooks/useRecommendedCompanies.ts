import { useState, useEffect, useCallback } from 'react';
import {
  getRecommendedCompanies,
  type RecommendedCompany,
} from '../api/company';

export function useRecommendedCompanies(limit: number = 10) {
  const [companies, setCompanies] = useState<RecommendedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecommendedCompanies(limit, { signal });
        setCompanies(data);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === 'CanceledError' ||
            (err as unknown as Record<string, unknown>).code === 'ERR_CANCELED' ||
            err.name === 'AbortError')
        )
          return;
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch recommended companies')
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCompanies(controller.signal);
    return () => controller.abort();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    refetch: () => fetchCompanies(),
  };
}
