import { useQueryClient } from '@tanstack/react-query';
import { getEmployerApplicationById } from '../api/application';
import { ApplicantDetail } from '../app/pages/employer/all-applications/data';

const SINGLE_KEY = (id: string | number) =>
  ['employer-application', id] as const;

export function prefetchEmployerApplication(id: string | number) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.prefetchQuery<ApplicantDetail>({
      queryKey: SINGLE_KEY(id),
      queryFn: async () =>
        (await getEmployerApplicationById(id)) as ApplicantDetail,
      staleTime: 60 * 1000,
    });
  };
}
