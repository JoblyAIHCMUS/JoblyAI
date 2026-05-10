import { useState, useEffect } from 'react';
import { getCategories, type JobCategory } from '@/api-client/jobs';

/**
 * Hook for fetching job categories
 * Fetches categories on mount and caches them
 */
export function useCategories() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err: unknown) {
        setError(err);
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
