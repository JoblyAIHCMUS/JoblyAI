import { useState } from 'react';
import { deleteSkill } from '@/api-client/candidate/skill';

interface UseDeleteSkillOptions {
  onSuccess?: (data: number) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteSkill(options?: UseDeleteSkillOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<number | null>(null);

  const deleteSkillRecord = async (skillId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteSkill(skillId);
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

  return { deleteSkillRecord, loading, error, data };
}
