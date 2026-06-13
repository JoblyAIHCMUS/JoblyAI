import { useInfiniteQuery } from '@tanstack/react-query';
import { listEmployerApplications } from '../api/application';
import { PaginatedApplicationsResponse } from '../types/application';

const DEFAULT_PAGE_SIZE = 20;

export function useEmployerAllApplications(pageSize: number = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery<PaginatedApplicationsResponse, Error>({
    queryKey: ['employer-applications', 'all', pageSize],
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return await listEmployerApplications({ page, pageSize });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}
