// apps/web/src/api-hook/pre-shortlist/usePreShortlistQuestionsForJob.ts

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getPreShortlistQuestionsForJob,
  type PreShortlistQuestionsForJobView,
} from '@/api-client/pre-shortlist';

export function usePreShortlistQuestionsForJob(jobId: number) {
  const [data, setData] = useState<PreShortlistQuestionsForJobView | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetch = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPreShortlistQuestionsForJob(id);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!Number.isFinite(jobId) || jobId <= 0) return;
    fetch(jobId).catch(() => {
      /* error captured in state */
    });
  }, [jobId, fetch]);

  return { data, loading, error, refetch: fetch };
}
