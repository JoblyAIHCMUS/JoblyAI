import { useState } from 'react';
import { getCandidateProfile, type CandidateProfileResponse } from '@/api-client/candidate';

interface UseGetCandidateProfileOptions {
  onSuccess?: (data: CandidateProfileResponse) => void;
  onError?: (error: unknown) => void;
}

export function useGetCandidateProfile(
  options?: UseGetCandidateProfileOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateProfileResponse | null>(null);

  const fetchCandidateProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCandidateProfile();
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

  return { fetchCandidateProfile, loading, error, data };
}