import { useState } from 'react';
import { removeCompanyEmployee } from '@/api-client/company';

interface UseRemoveCompanyEmployeeOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useRemoveCompanyEmployee(
  options?: UseRemoveCompanyEmployeeOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submitRemoveEmployee = async (companyId: number, email: string) => {
    setLoading(true);
    setError(null);

    try {
      await removeCompanyEmployee(companyId, email);
      options?.onSuccess?.();
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitRemoveEmployee, loading, error };
}
