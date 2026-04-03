import { useState } from 'react';
import {
  createCandidateAbout,
  updateCandidateAbout,
  type CreateAboutPayload,
  type UpdateAboutPayload,
  type AboutResponse,
} from '@/api-client/candidate/about';

interface UseUpdateCandidateAboutOptions {
  onSuccess?: (data: AboutResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for updating or creating candidate about section (bio only)
 *
 * Usage:
 * const { updateAbout, createAbout } = useUpdateCandidateAbout({
 *   onSuccess: (data) => console.log('Updated', data),
 * });
 *
 * await updateAbout({ id: 1, bio: 'My bio' });
 * await createAbout({ bio: 'My bio' });
 */
export function useUpdateCandidateAbout(
  options?: UseUpdateCandidateAboutOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<AboutResponse | null>(null);

  const updateAbout = async (payload: UpdateAboutPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateCandidateAbout(payload);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAbout = async (payload: CreateAboutPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createCandidateAbout(payload);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateAbout, createAbout, loading, error, data };
}
