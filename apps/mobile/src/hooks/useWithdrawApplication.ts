import { useCallback, useState } from 'react';

import { withdrawCandidateApplication } from '../api/application';

export function useWithdrawApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const withdraw = useCallback(async (applicationId: number) => {
    setLoading(true);
    setError(null);

    try {
      await withdrawCandidateApplication(applicationId);
      return true;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { withdraw, loading, error };
}
