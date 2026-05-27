import { useState, useEffect } from 'react';
import { getPopularJobCategories, type PopularJobCategory } from '@/api-client/jobs';

/**
 * Hook for fetching popular job categories with counts
 */
export function usePopularCategories(limit = 8) {
  const [categories, setCategories] = useState<PopularJobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPopularJobCategories(limit);
        setCategories(data);
      } catch (err: unknown) {
        setError(err);
        console.error('Failed to fetch popular categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCategories();
  }, [limit]);

  return { categories, loading, error };
}
