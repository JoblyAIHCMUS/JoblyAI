import { useState, useEffect, useCallback } from 'react';
import { getPopularCategories } from '../api/jobs';
import { PopularJobCategory } from '../types/job';

export function usePopularCategories(limit: number) {
  const [categories, setCategories] = useState<PopularJobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPopularCategories(limit, { signal });
        setCategories(data);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === 'CanceledError' ||
            (err as unknown as Record<string, unknown>).code === 'ERR_CANCELED' ||
            err.name === 'AbortError')
        )
          return;
        setError(
          err instanceof Error ? err : new Error('Failed to fetch popular categories')
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: () => fetchCategories() };
}
