import { useState } from 'react';
import {
  UpdateUserDTO,
  UpdateUserResponse,
  updateUserProfile,
} from '@/api-client/user';

interface UseUpdateUserProfileOptions {
  onSuccess?: (data: UpdateUserResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for updating user's basic profile information (firstName, lastName)
 *
 * Usage:
 * ```typescript
 * const { updateProfile, loading, error } = useUpdateUserProfile({
 *   onSuccess: () => console.log('Updated!'),
 * });
 *
 * await updateProfile({ firstName: 'John', lastName: 'Doe' });
 * ```
 */
export function useUpdateUserProfile(options?: UseUpdateUserProfileOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<UpdateUserResponse | null>(null);

  const updateProfile = async (updateDto: UpdateUserDTO) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateUserProfile(updateDto);
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
