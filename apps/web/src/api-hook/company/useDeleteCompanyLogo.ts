import { useState, useCallback } from 'react';
import { deleteCompanyLogo, type Company } from '@/api-client/company';

interface UseDeleteCompanyLogoOptions {
  onSuccess?: (data: Company) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteCompanyLogo(options?: UseDeleteCompanyLogoOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<Company | null>(null);

  const deleteLogoRecord = useCallback(
    async (companyId: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await deleteCompanyLogo(companyId);
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

  return { deleteLogoRecord, loading, error, data };
}
