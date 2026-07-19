import { useState } from 'react';
import {
  removeCompanyEmployee,
  type RemoveCompanyEmployeePayload,
} from '../api/company';

interface UseRemoveCompanyEmployeeOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useRemoveCompanyEmployee(
  options: UseRemoveCompanyEmployeeOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submitRemove = async (
    companyId: number,
    payload: RemoveCompanyEmployeePayload
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await removeCompanyEmployee(companyId, payload);
      options.onSuccess?.();
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitRemove, loading, error };
}
