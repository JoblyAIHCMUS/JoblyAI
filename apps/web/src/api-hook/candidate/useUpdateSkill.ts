import { useState } from 'react';
import { updateSkill } from '@/api-client/candidate/skill';
import type { CandidateSkill } from '@/api-client/candidate/types';

interface UseUpdateSkillOptions {
  onSuccess?: (data: CandidateSkill) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateSkill(options?: UseUpdateSkillOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateSkill | null>(null);

  const updateSkillRecord = async (
    id: number,
    data: { level?: string; years?: number }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateSkill(id, data);
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

  return { updateSkillRecord, loading, error, data };
}
