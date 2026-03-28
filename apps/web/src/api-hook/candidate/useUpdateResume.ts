import { useState } from 'react';
import {
  updateResume,
  type CandidateResume,
  type UpdateResumePayload,
} from '@/api-client/candidate';

interface UseUpdateResumeOptions {
  onSuccess?: (data: CandidateResume) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateResume(options?: UseUpdateResumeOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateResume | null>(null);

  const updateResumeRecord = async (payload: UpdateResumePayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateResume(payload);
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

  return { updateResumeRecord, loading, error, data };
}