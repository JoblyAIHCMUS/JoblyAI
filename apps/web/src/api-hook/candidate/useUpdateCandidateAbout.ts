import { useState } from 'react';
import { updateCandidateAbout } from '@/api-client/candidate/about';

interface UseUpdateCandidateAboutOptions {
  onSuccess?: (data: { about: string[] }) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateCandidateAbout(options?: UseUpdateCandidateAboutOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<{ about: string[] } | null>(null);

  const updateAbout = async (about: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateCandidateAbout(about);
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

  return { updateAbout, loading, error, data };
}
