import { useState, useCallback } from 'react';
import {
  getJobResumeMatchExplanation,
  type MatchExplanation,
} from '@/api-client/matching/explanation';

interface UseJobResumeMatchExplanationOptions {
  onSuccess?: (data: MatchExplanation) => void;
  onError?: (error: unknown) => void;
}

export function useJobResumeMatchExplanation(
  options?: UseJobResumeMatchExplanationOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<MatchExplanation | null>(null);

  const fetchExplanation = useCallback(
    async (jobId: number, resumeId: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getJobResumeMatchExplanation(jobId, resumeId);
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
    },
    [options]
  );

  return { fetchExplanation, loading, error, data };
}
