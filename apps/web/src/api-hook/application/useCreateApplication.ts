import { useState } from 'react';
import {
  ApplicationRecord,
  CreateApplicationPayload,
  createApplication,
} from '@/api-client/application';

interface UseCreateApplicationOptions {
  onSuccess?: (data: ApplicationRecord) => void;
  onError?: (error: unknown) => void;
}

export function useCreateApplication(options?: UseCreateApplicationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ApplicationRecord | null>(null);

  const submitApplication = async (payload: CreateApplicationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createApplication(payload);
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

  return { submitApplication, loading, error, data };
}
