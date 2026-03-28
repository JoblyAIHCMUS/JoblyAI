import { useState } from 'react';
import {
  Company,
  PatchCompanyPayload,
  UpdateCompanyPayload,
  patchCompany,
  updateCompany,
} from '@/api-client/company';

interface UseUpdateCompanyOptions {
  onSuccess?: (data: Company) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateCompany(options?: UseUpdateCompanyOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<Company | null>(null);

  const submitUpdate = async (id: number, payload: UpdateCompanyPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateCompany(id, payload);
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
  };

  const submitPatch = async (id: number, payload: PatchCompanyPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await patchCompany(id, payload);
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
  };

  return { submitUpdate, submitPatch, loading, error, data };
}
