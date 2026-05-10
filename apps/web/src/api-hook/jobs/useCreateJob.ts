import { useState } from 'react';
import {
  CreateJobPayload,
  JobPosting,
  createJobPosting,
} from '@/api-client/jobs';

interface UseCreateJobOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for creating a new job posting
 * Requires authentication with employer role
 */
export function useCreateJob(options?: UseCreateJobOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const submitJob = async (payload: CreateJobPayload) => {
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

  return { submitJob, loading, error, data };
}
