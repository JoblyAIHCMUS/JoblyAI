import { useState, useEffect, useCallback, useRef } from 'react';
import { getSimilarJobs, SimilarJobsQuery } from '../api/jobs';
import { JobPosting } from '../types/job';

export function useSimilarJobs(params: SimilarJobsQuery) {
  const [data, setData] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const paramsRef = useRef(params);

  const fetchSimilarJobs = useCallback(async (query: SimilarJobsQuery) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const response = await getSimilarJobs(query, {
        signal: controller.signal,
      });
      setData(response.jobs || []);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' ||
          (err as unknown as Record<string, unknown>).code === 'ERR_CANCELED' ||
          err.name === 'AbortError')
      )
        return;
      setError(
        err instanceof Error ? err : new Error('Failed to fetch similar jobs')
      );
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    const query = paramsRef.current;
    if (!query.jobId) return true;

    setLoading(true);
    setError(null);
    try {
      const response = await getSimilarJobs(query);
      setData(response.jobs || []);
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
      setError(
        err instanceof Error ? err : new Error('Failed to fetch similar jobs')
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    paramsRef.current = params;
    if (!params.jobId) {
      setLoading(false);
      return;
    }
    let cleanupFn: (() => void) | undefined;

    const runFetch = async () => {
      const cleanup = await fetchSimilarJobs(paramsRef.current);
      cleanupFn = cleanup;
    };

    runFetch();

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [params.jobId, params.companyId, params.location, fetchSimilarJobs]);

  return { data, loading, error, refresh };
}
