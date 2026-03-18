import { useState } from 'react';
import { createJobPosting, CreateJobPayload } from '@/api-client/jobsAPI';

interface UseCreateJobOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useCreateJob(options?: UseCreateJobOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  const createJob = async (payload: CreateJobPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createJobPosting(payload);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createJob, loading, error, data };
}
