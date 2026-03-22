import { useState } from 'react';
import {
  ApplicationRecord,
  RejectApplicationPayload,
  rejectEmployerApplication,
} from '@/api-client/application';

interface UseRejectApplicationOptions {
  onSuccess?: (data: ApplicationRecord) => void;
  onError?: (error: unknown) => void;
}

export function useRejectApplication(options?: UseRejectApplicationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ApplicationRecord | null>(null);

  const rejectApplication = async (
    id: number,
    payload: RejectApplicationPayload
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await rejectEmployerApplication(id, payload);
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

  return { rejectApplication, loading, error, data };
}
