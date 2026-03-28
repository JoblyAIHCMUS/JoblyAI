import { useState } from 'react';
import {
  updateExperience,
  type CandidateExperience,
  type UpdateExperiencePayload,
} from '@/api-client/candidate';

interface UseUpdateExperienceOptions {
  onSuccess?: (data: CandidateExperience) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateExperience(options?: UseUpdateExperienceOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateExperience | null>(null);

  const updateExperienceRecord = async (payload: UpdateExperiencePayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateExperience(payload);
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

  return { updateExperienceRecord, loading, error, data };
}
