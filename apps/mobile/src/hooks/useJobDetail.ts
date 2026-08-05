import { useState, useEffect, useCallback, useRef } from 'react';
import { getJobById } from '../api/jobs';
import { JobPosting } from '../types/job';

export function useJobDetail(jobId: number | null) {
  const [data, setData] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const jobIdRef = useRef(jobId);

  const fetchJob = useCallback(async (id: number) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const response = await getJobById(id, { signal: controller.signal });
      setData(response);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' ||
          (err as unknown as Record<string, unknown>).code === 'ERR_CANCELED' ||
          err.name === 'AbortError')
      )
        return;
      setError(err instanceof Error ? err : new Error('Failed to fetch job'));
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    const id = jobIdRef.current;
    if (!id) return true;

    setLoading(true);
    setError(null);
    try {
      const response = await getJobById(id);
      setData(response);
      return true;
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' ||
          (err as unknown as Record<string, unknown>).code === 'ERR_CANCELED' ||
          err.name === 'AbortError')
      ) {
        return true;
      }
      setError(err instanceof Error ? err : new Error('Failed to fetch job'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }
    jobIdRef.current = jobId;
    let cleanupFn: (() => void) | undefined;

    const runFetch = async () => {
      const cleanup = await fetchJob(jobId);
      cleanupFn = cleanup;
    };

    runFetch();

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [jobId, fetchJob]);

  return {
    data,
    loading,
    error,
    refresh,
    refetch: () => jobIdRef.current && fetchJob(jobIdRef.current),
  };
}
