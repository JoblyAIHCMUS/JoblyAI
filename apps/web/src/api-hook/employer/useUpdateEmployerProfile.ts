import { useState } from 'react';
import {
  type UpdateEmployerProfilePayload,
  type UpdateEmployerProfileResponse,
  updateEmployerProfile,
} from '@/api-client/employer';

interface UseUpdateEmployerProfileOptions {
  onSuccess?: (data: UpdateEmployerProfileResponse) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateEmployerProfile(
  options?: UseUpdateEmployerProfileOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<UpdateEmployerProfileResponse | null>(null);

  const updateProfile = async (updateDto: UpdateEmployerProfilePayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateEmployerProfile(updateDto);
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

  return { updateProfile, loading, error, data };
}
