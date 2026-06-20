import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  listEmployerApplications,
  shortlistApplication,
  rejectApplication,
  moveToOfferApplication,
} from '../api/application';
import {
  EmployerApplicationsQuery,
  PaginatedApplicationsResponse,
} from '../types/application';
import Toast from 'react-native-toast-message';

const LIST_KEY = ['employer-applications'] as const;
const singleKey = (id: string | number) =>
  ['employer-application', id] as const;

type Ctx = {
  previousSingle?: unknown;
  previousLists: Array<[readonly unknown[], unknown]>;
};

function readCachedSingle(
  queryClient: QueryClient,
  id: string | number
): { status?: string; hiringStage?: string } | null {
  return (
    (queryClient.getQueryData(singleKey(id)) as
      | { status?: string; hiringStage?: string }
      | undefined) ?? null
  );
}

function rollback(
  queryClient: QueryClient,
  id: string | number,
  ctx: Ctx | undefined
) {
  if (ctx?.previousSingle) {
    queryClient.setQueryData(singleKey(id), ctx.previousSingle);
  }
  if (ctx?.previousLists) {
    for (const [key, value] of ctx.previousLists) {
      queryClient.setQueryData(key, value);
    }
  }
}

export function useEmployerJobApplications(
  jobId?: number,
  searchQuery?: string,
  pageSize?: number
) {
  return useInfiniteQuery<PaginatedApplicationsResponse, Error>({
    queryKey: ['employer-applications', jobId, searchQuery, pageSize],
    queryFn: async (context) => {
      const pageParam = (context.pageParam as number | undefined) ?? 1;
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
      return await listEmployerApplications(query);
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!jobId,
  });
}

export function useShortlistApplication() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string, Ctx>({
    mutationFn: (applicationId) => shortlistApplication(applicationId),
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: singleKey(applicationId) });
      const previousSingle = queryClient.getQueryData(singleKey(applicationId));
      const previousLists = queryClient.getQueriesData({ queryKey: LIST_KEY });
      const current = readCachedSingle(queryClient, applicationId);
      if (current) {
        queryClient.setQueryData(singleKey(applicationId), {
          ...current,
          status: 'INTERVIEW',
          hiringStage: 'Interview',
        });
      }
      return { previousSingle, previousLists };
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Applicant moved to interview stage',
      });
    },
    onError: (err, applicationId, ctx) => {
      rollback(queryClient, applicationId, ctx);
      Toast.show({
        type: 'error',
        text1: 'Failed to advance applicant',
        text2: err instanceof Error ? err.message : undefined,
      });
    },
    onSettled: (_data, _err, applicationId) => {
      void queryClient.invalidateQueries({
        queryKey: singleKey(applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { applicationId: string; feedback: string },
    Ctx
  >({
    mutationFn: ({ applicationId, feedback }) =>
      rejectApplication(applicationId, feedback),
    onMutate: async ({ applicationId }) => {
      await queryClient.cancelQueries({ queryKey: singleKey(applicationId) });
      const previousSingle = queryClient.getQueryData(singleKey(applicationId));
      const previousLists = queryClient.getQueriesData({ queryKey: LIST_KEY });
      const current = readCachedSingle(queryClient, applicationId);
      if (current) {
        queryClient.setQueryData(singleKey(applicationId), {
          ...current,
          status: 'REJECTED',
          hiringStage: 'Rejected',
        });
      }
      return { previousSingle, previousLists };
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Applicant rejected' });
    },
    onError: (err, { applicationId }, ctx) => {
      rollback(queryClient, applicationId, ctx);
      Toast.show({
        type: 'error',
        text1: 'Failed to reject applicant',
        text2: err instanceof Error ? err.message : undefined,
      });
    },
    onSettled: (_data, _err, { applicationId }) => {
      void queryClient.invalidateQueries({
        queryKey: singleKey(applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useMoveToOfferApplication() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string, Ctx>({
    mutationFn: (applicationId) => moveToOfferApplication(applicationId),
    onMutate: async (applicationId) => {
      await queryClient.cancelQueries({ queryKey: singleKey(applicationId) });
      const previousSingle = queryClient.getQueryData(singleKey(applicationId));
      const previousLists = queryClient.getQueriesData({ queryKey: LIST_KEY });
      const current = readCachedSingle(queryClient, applicationId);
      if (current) {
        queryClient.setQueryData(singleKey(applicationId), {
          ...current,
          status: 'OFFER',
          hiringStage: 'Offer',
        });
      }
      return { previousSingle, previousLists };
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Applicant moved to offer stage' });
    },
    onError: (err, applicationId, ctx) => {
      rollback(queryClient, applicationId, ctx);
      Toast.show({
        type: 'error',
        text1: 'Failed to move to offer',
        text2: err instanceof Error ? err.message : undefined,
      });
    },
    onSettled: (_data, _err, applicationId) => {
      void queryClient.invalidateQueries({
        queryKey: singleKey(applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
