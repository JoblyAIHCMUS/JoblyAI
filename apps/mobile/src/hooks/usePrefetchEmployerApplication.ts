import { useQueryClient } from '@tanstack/react-query';
import { getEmployerApplicationById } from '../api/application';
import type { ApplicantDetail } from '../app/pages/employer/all-applications/data';
import {
  toApplicantDetail,
  type RawApplication,
} from './useEmployerApplication';

const SINGLE_KEY = (id: string | number) =>
  ['employer-application', id] as const;

export function usePrefetchEmployerApplication(id: string | number) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.prefetchQuery<ApplicantDetail>({
      queryKey: SINGLE_KEY(id),
      queryFn: async () =>
        toApplicantDetail(
          (await getEmployerApplicationById(id)) as RawApplication
        ),
      staleTime: 60 * 1000,
    });
  };
}
