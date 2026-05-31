import { useInfiniteQuery } from '@tanstack/react-query';
import { listEmployerApplications } from '../api/application';
import { EmployerApplicationsQuery } from '../types/application';

export function useEmployerJobApplications(
  jobId?: number,
  searchQuery?: string,
  pageSize?: number
) {
  return useInfiniteQuery({
    queryKey: ['employer-applications', jobId, searchQuery, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      if (!jobId) {
        return {
          applications: [],
          total: 0,
          page: 1,
          pageSize: pageSize || 0,
          totalPages: 0,
        };
      }

      const query: EmployerApplicationsQuery = {
        jobId,
        page: pageParam,
        ...(pageSize && { pageSize }),
        ...(searchQuery && { search: searchQuery }),
      };

      // Pass signal for request cancellation if API supports it later
      return await listEmployerApplications(query);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!jobId,
  });
}
