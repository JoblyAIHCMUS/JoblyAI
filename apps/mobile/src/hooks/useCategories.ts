import { useState, useEffect } from 'react';
import { getCategories } from '../api/jobs';
import { JobCategory } from '../types/job';

export function useCategories() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories({ signal });
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
        err instanceof Error ? err : new Error('Failed to fetch categories')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, []);

  return { categories, loading, error, refetch: () => fetchCategories() };
}
