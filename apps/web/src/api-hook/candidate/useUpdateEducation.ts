import { useState } from 'react';
import {
  updateEducation,
  type UpdateEducationPayload,
} from '@/api-client/candidate';
import { type CandidateEducation } from '@/types/profile';
interface UseUpdateEducationOptions {
  onSuccess?: (data: CandidateEducation) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateEducation(options?: UseUpdateEducationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateEducation | null>(null);

  const updateEducationRecord = async (payload: UpdateEducationPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateEducation(payload);
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

  return { updateEducationRecord, loading, error, data };
}
