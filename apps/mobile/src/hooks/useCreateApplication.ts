import { useState } from 'react';
import { createApplication as createApplicationApi } from '../api/application';

interface UseCreateApplicationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

export function useCreateApplication(options?: UseCreateApplicationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<any | null>(null);

  const submitApplication = async (jobId: number, resumeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createApplicationApi(jobId, resumeId);
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
