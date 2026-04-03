import { useState } from 'react';
import {
  updateUserProfile,
  type UpdateUserDTO,
  type UpdateUserResponse,
} from '@/api-client/user';

interface UseUpdatePersonalDetailsOptions {
  onSuccess?: (data: UpdateUserResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for updating user personal details
 * Supports: firstName, lastName, phoneNumber, dateOfBirth, gender
 *
 * Usage:
 * const { updateDetails, loading, error, data } = useUpdatePersonalDetails({
 *   onSuccess: (data) => console.log('Updated', data),
 * });
 *
 * await updateDetails({ firstName: 'John', lastName: 'Doe', ... });
 */
export function useUpdatePersonalDetails(
  options?: UseUpdatePersonalDetailsOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<UpdateUserResponse | null>(null);

  const updateDetails = async (payload: UpdateUserDTO) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateUserProfile(payload);
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

  return { updateDetails, loading, error, data };
}
