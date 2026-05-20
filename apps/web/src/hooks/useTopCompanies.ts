'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTopCompaniesWithMostJobs } from '@/api-client/company';
import type { Company } from '@/api-client/company';

export function useTopCompanies(limit = 5) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopCompaniesWithMostJobs(limit);
        setCompanies(data);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === 'CanceledError' ||
            (err as unknown as Record<string, unknown>).code ===
              'ERR_CANCELED' ||
            err.name === 'AbortError')
        )
          return;
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch top companies')
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

  return { companies, loading, error, refetch: () => fetchCompanies() };
}
