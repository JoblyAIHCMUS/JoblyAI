import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  getEmployerApplicationById,
  type ApplicationRecord,
} from '@/api-client/application';
import { mapApplicationRecordToApplicantDetail } from '@/api-client/application/mappers';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';
import { type HiringStage } from '@/features/employer/hiringStage';

const SINGLE_KEY = (id: string | number) =>
  ['employer-application', id] as const;
const LIST_KEY = ['employer-applications'] as const;

function readFromListCache(
  queryClient: QueryClient,
  id: string | number
): ApplicantDetail | null {
  const queries = queryClient.getQueriesData<{
    pages: { applications: ApplicationRecord[] }[];
  }>({ queryKey: LIST_KEY });

  for (const [, cached] of queries) {
    if (!cached?.pages) continue;
    for (const page of cached.pages) {
      const hit = page.applications.find((a) => String(a.id) === String(id));
      if (hit) return mapApplicationRecordToApplicantDetail(hit);
    }
  }
  return null;
}

export function useEmployerApplication(id: string | number) {
  const queryClient = useQueryClient();

  const query = useQuery<ApplicantDetail, Error>({
    queryKey: SINGLE_KEY(id),
    queryFn: async () => {
      const record = await getEmployerApplicationById(id);
      return mapApplicationRecordToApplicantDetail(record);
    },
    initialData: () => readFromListCache(queryClient, id) ?? undefined,
    staleTime: 30 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export type { HiringStage };
