import { useState } from 'react';
import { createJobPosting, CreateJobPayload } from '@/api-client/jobsAPI';

type CreateJobResult = Awaited<ReturnType<typeof createJobPosting>>;

interface UseCreateJobOptions {
  onSuccess?: (data: CreateJobResult) => void;
  onError?: (error: unknown) => void;
}

export function useCreateJob(options?: UseCreateJobOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<CreateJobResult | null>(null);

  const createJob = async (payload: CreateJobPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createJobPosting(payload);
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

  return { createJob, loading, error, data };
}
