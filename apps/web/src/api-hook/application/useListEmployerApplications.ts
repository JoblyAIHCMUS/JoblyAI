import { useInfiniteQuery } from '@tanstack/react-query';
import {
  listEmployerApplications,
  type EmployerApplicationsQuery,
  type PaginatedApplicationsResponse,
} from '@/api-client/application';

interface UseListEmployerApplicationsOptions {
  pageSize?: number;
  jobId?: number;
  status?: EmployerApplicationsQuery['status'];
  search?: string;
}

export function useListEmployerApplications(
  options: UseListEmployerApplicationsOptions = {}
) {
  const { pageSize = 10, jobId, status, search } = options;

  return useInfiniteQuery<PaginatedApplicationsResponse, Error>({
    queryKey: ['employer-applications', jobId, status, search, pageSize],
    queryFn: async ({ pageParam = 1 }) =>
      listEmployerApplications({
        jobId,
        status,
        search,
        page: pageParam as number,
        pageSize,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });
}
