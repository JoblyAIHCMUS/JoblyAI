import { useCallback, useState } from 'react';
import { getCompanyBySlug, type Company } from '@/api-client/company';

interface UseGetCompanyBySlugOptions {
  onSuccess?: (data: Company) => void;
  onError?: (error: unknown) => void;
}

export function useGetCompanyBySlug(
  options?: UseGetCompanyBySlugOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<Company | null>(null);

  const fetchCompanyBySlug = useCallback(
    async (slug: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getCompanyBySlug(slug);
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

  return { fetchCompanyBySlug, loading, error, data };
}