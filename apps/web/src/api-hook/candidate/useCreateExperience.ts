import { useState } from 'react';
import {
  createExperience,
  type CreateExperiencePayload,
} from '@/api-client/candidate';
import { CandidateExperience } from '@/types/candidate';

interface UseCreateExperienceOptions {
  onSuccess?: (data: CandidateExperience) => void;
  onError?: (error: unknown) => void;
}

export function useCreateExperience(options?: UseCreateExperienceOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateExperience | null>(null);

  const createExperienceRecord = async (payload: CreateExperiencePayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createExperience(payload);
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

  return { createExperienceRecord, loading, error, data };
}
