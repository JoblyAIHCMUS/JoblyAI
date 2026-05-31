import { useQuery } from '@tanstack/react-query';
import { getEmployerJobById } from '../api/employerJobs';

/**
 * Hook for fetching detailed information about a single job as an authenticated employer.
 * Uses TanStack Query for caching and automatic refetching.
 */
export function useEmployerJobDetail(id: number | null) {
  return useQuery({
    queryKey: ['employer-job-detail', id],
    queryFn: ({ signal }) => getEmployerJobById(id!, { signal }),
    enabled: id !== null && !Number.isNaN(id),
  });
}
