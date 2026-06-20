import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  shortlistEmployerApplication,
  type ApplicationRecord,
} from '@/api-client/application';
import { mapApplicationRecordToApplicantDetail } from '@/api-client/application/mappers';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';

const SINGLE_KEY = (id: string | number) =>
  ['employer-application', id] as const;
const LIST_KEY = ['employer-applications'] as const;

type Ctx = {
  previousSingle?: ApplicantDetail;
  previousLists: Array<[readonly unknown[], unknown]>;
};

export function useShortlistApplication() {
  const queryClient = useQueryClient();

  return useMutation<ApplicationRecord, Error, number, Ctx>({
    mutationFn: (id) => shortlistEmployerApplication(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SINGLE_KEY(id) });
      const previousSingle = queryClient.getQueryData<ApplicantDetail>(
        SINGLE_KEY(id)
      );
      const previousLists = queryClient.getQueriesData({ queryKey: LIST_KEY });

      if (previousSingle) {
        queryClient.setQueryData<ApplicantDetail>(SINGLE_KEY(id), {
          ...previousSingle,
          hiringStage: 'Interview',
        });
      }
      // No-op for list caches here: the list row's hiringStage is derived
      // from the cached ApplicationRecord's `status`. The list cache is
      // invalidated on settle; that's the source of truth for the row.

      return { previousSingle, previousLists };
    },

    onSuccess: (serverRecord, id) => {
      queryClient.setQueryData<ApplicantDetail>(
        SINGLE_KEY(id),
        mapApplicationRecordToApplicantDetail(serverRecord)
      );
      toast.success('Applicant moved to interview stage');
    },

    onError: (err, _id, ctx) => {
      if (ctx?.previousSingle) {
        queryClient.setQueryData(SINGLE_KEY(_id), ctx.previousSingle);
      }
      if (ctx?.previousLists) {
        for (const [key, value] of ctx.previousLists) {
          queryClient.setQueryData(key, value);
        }
      }
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to move applicant to interview';
      toast.error(message);
    },

    onSettled: (_data, _err, id) => {
      void queryClient.invalidateQueries({ queryKey: SINGLE_KEY(id) });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
