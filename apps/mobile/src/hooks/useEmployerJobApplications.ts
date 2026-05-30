import { useInfiniteQuery } from '@tanstack/react-query';
import { listEmployerApplications } from '../api/application';
import { EmployerApplicationsQuery } from '../types/application';

const PAGE_SIZE = 10;

export function useEmployerJobApplications(jobId?: number, searchQuery?: string) {
  return useInfiniteQuery({
    queryKey: ['employer-applications', jobId, searchQuery],
    queryFn: async ({ pageParam = 1, signal }) => {
      if (!jobId) {
        return {
          applications: [],
          total: 0,
          page: 1,
          pageSize: PAGE_SIZE,
          totalPages: 0,
        };
      }
      
      const query: EmployerApplicationsQuery = {
        jobId,
        page: pageParam,
        pageSize: PAGE_SIZE,
        ...(searchQuery && { search: searchQuery })
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
