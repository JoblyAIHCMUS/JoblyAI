import { useState } from 'react';
import {
  createEducation,
  type CandidateEducation,
  type CreateEducationPayload,
} from '@/api-client/candidate';

interface UseCreateEducationOptions {
  onSuccess?: (data: CandidateEducation) => void;
  onError?: (error: unknown) => void;
}

export function useCreateEducation(options?: UseCreateEducationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateEducation | null>(null);

  const createEducationRecord = async (payload: CreateEducationPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createEducation(payload);
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

  return { createEducationRecord, loading, error, data };
}
