import { useState } from 'react';
import {
  JobPosting,
  getJobById,
} from '@/api-client/jobs';

interface UseJobDetailOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching detailed information about a single job
 */
export function useJobDetail(options?: UseJobDetailOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const fetchJobDetail = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getJobById(id);
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

  return { fetchJobDetail, loading, error, data };
}
