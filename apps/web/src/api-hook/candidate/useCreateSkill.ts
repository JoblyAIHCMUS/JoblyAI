import { useState } from 'react';
import { createSkill } from '@/api-client/candidate/skill';
interface UseCreateSkillOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: unknown) => void;
}

export function useCreateSkill(options?: UseCreateSkillOptions) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null as unknown);
    const [data, setData] = useState<string | null>(null);

    const createSkillRecord = async (skill: string) => {
        setLoading(true);
        setError(null);
        try {
            // Giả sử có một API client để tạo skill, ví dụ:
            const result = await createSkill(skill);
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

    return { createSkillRecord, loading, error, data };
}