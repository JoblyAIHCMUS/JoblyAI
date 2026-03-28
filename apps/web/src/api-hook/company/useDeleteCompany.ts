import { useState } from 'react';
import { deleteCompany } from '@/api-client/company';

interface UseDeleteCompanyOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useDeleteCompany(options?: UseDeleteCompanyOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submitDelete = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await deleteCompany(id);
      options?.onSuccess?.();
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitDelete, loading, error };
}
