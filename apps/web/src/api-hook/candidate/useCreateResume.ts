import { useState } from 'react';
import { createResume, type CreateResumePayload } from '@/api-client/candidate';
import { CandidateResume } from '@/types/candidate';

interface UseCreateResumeOptions {
  onSuccess?: (data: CandidateResume) => void;
  onError?: (error: unknown) => void;
}

export function useCreateResume(options?: UseCreateResumeOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateResume | null>(null);

  const createResumeRecord = async (payload: CreateResumePayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createResume(payload);
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

  return { createResumeRecord, loading, error, data };
}
