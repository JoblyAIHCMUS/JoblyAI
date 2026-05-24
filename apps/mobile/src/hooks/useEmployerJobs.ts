import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listEmployerJobsByUser,
  listEmployerJobsByCompany,
  updateJobPostingStatus,
  deleteJobPosting,
} from '../api/employerJobs';
import { useGetEmployerProfile } from './useGetEmployerProfile';
import { useUser } from './useUser';
import { JobStatus } from '../types/job';

const PAGE_SIZE = 10;

export function useEmployerJobsQuery() {
  const { data: user } = useUser();
  const { data: profile, isLoading: isProfileLoading } =
    useGetEmployerProfile();

  const useCompany = !!profile?.company?.id;
  const companyId = profile?.company?.id;
  const userId = user?.id;

  return useInfiniteQuery({
    queryKey: ['employer-jobs', { useCompany, companyId, userId }],
    queryFn: async ({ pageParam = 1, signal }) => {
      if (useCompany && companyId) {
        return await listEmployerJobsByCompany(
          companyId,
          pageParam,
          PAGE_SIZE,
          { signal }
        );
      } else if (userId) {
        return await listEmployerJobsByUser(userId, pageParam, PAGE_SIZE, {
          signal,
        });
      }
      return {
        jobs: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        totalPages: 0,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !isProfileLoading && !!(userId || companyId),
  });
}

export function useJobActions() {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: JobStatus }) =>
      updateJobPostingStatus(id, status),
    onSuccess: (updatedJob, variables) => {
      // Update cache immediately with the server response
      queryClient.setQueriesData(
        { queryKey: ['employer-jobs'] },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              jobs: page.jobs.map((job: any) =>
                // 1. Safely compare IDs regardless of string/number types
                String(job.id) === String(variables.id)
                  ? // 2. Merge the data to preserve fields like `applicants` count
                    { ...job, ...updatedJob }
                  : job
              ),
            })),
          };
        }
      );
    },
  });

  const deleteJob = useMutation({
    mutationFn: (id: number) => deleteJobPosting(id),
    onSuccess: (data, variables) => {
      // Remove from cache immediately
      queryClient.setQueriesData(
        { queryKey: ['employer-jobs'] },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              // Update the total count on each page
              total: Math.max(0, (page.total || 0) - 1),
              // Coerce to string here as well just to be safe
              jobs: page.jobs.filter(
                (job: any) => String(job.id) !== String(variables)
              ),
            })),
          };
        }
      );
    },
  });

  return { updateStatus, deleteJob };
}
