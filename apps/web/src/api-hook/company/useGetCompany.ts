import { useState, useCallback } from 'react';
import { Company, getCompanyById } from '@/api-client/company';

interface UseGetCompanyOptions {
  onSuccess?: (data: Company) => void;
  onError?: (error: unknown) => void;
}

export function useGetCompany(options?: UseGetCompanyOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<Company | null>(null);

  const fetchCompany = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCompanyById(id);
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
  }, [options]);

  return { fetchCompany, loading, error, data };
}
