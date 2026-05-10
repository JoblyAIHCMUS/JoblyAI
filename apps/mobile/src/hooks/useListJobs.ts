import { useState, useEffect, useCallback, useRef } from 'react';
import { listJobs } from '../api/jobs';
import { PaginatedJobsResponse, ListJobsQuery } from '../types/job';

export function useListJobs(initialQuery?: ListJobsQuery) {
  const [data, setData] = useState<PaginatedJobsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref for query to avoid dependency loops
  const queryRef = useRef(initialQuery);
  
  const fetchJobs = useCallback(async (query?: ListJobsQuery) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const response = await listJobs(query || queryRef.current, { signal: controller.signal });
      setData(response);
    } catch (err) {
      if (err instanceof Error && (err.name === 'CanceledError' || (err as any).code === 'ERR_CANCELED' || err.name === 'AbortError')) return;
      setError(err instanceof Error ? err : new Error('Failed to fetch jobs'));
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    
    const runFetch = async () => {
      const cleanup = await fetchJobs();
      cleanupFn = cleanup;
    };

    runFetch();

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [fetchJobs]);

  return { data, loading, error, fetchJobs };
}
