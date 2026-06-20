import { useQueryClient } from '@tanstack/react-query';
import {
  getEmployerApplicationById,
  type ApplicationRecord,
} from '@/api-client/application';
import { mapApplicationRecordToApplicantDetail } from '@/api-client/application/mappers';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';

const SINGLE_KEY = (id: string | number) =>
  ['employer-application', id] as const;

export function usePrefetchEmployerApplication(id: string | number) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.prefetchQuery<ApplicantDetail>({
      queryKey: SINGLE_KEY(id),
      queryFn: async () => {
        const record: ApplicationRecord = await getEmployerApplicationById(id);
        return mapApplicationRecordToApplicantDetail(record);
      },
      staleTime: 60 * 1000,
    });
  };
}
