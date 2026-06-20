import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  rejectEmployerApplication,
  type ApplicationRecord,
  type RejectApplicationPayload,
} from '@/api-client/application';
import { mapApplicationRecordToApplicantDetail } from '@/api-client/application/mappers';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';

const SINGLE_KEY = (id: string | number) =>
  ['employer-application', id] as const;
const LIST_KEY = ['employer-applications'] as const;

type RejectVars = { applicationId: number; payload: RejectApplicationPayload };

type Ctx = {
  previousSingle?: ApplicantDetail;
  previousLists: Array<[readonly unknown[], unknown]>;
};

export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation<ApplicationRecord, Error, RejectVars, Ctx>({
    mutationFn: ({ applicationId, payload }) =>
      rejectEmployerApplication(applicationId, payload),

    onMutate: async ({ applicationId }) => {
      await queryClient.cancelQueries({ queryKey: SINGLE_KEY(applicationId) });
      const previousSingle = queryClient.getQueryData<ApplicantDetail>(
        SINGLE_KEY(applicationId)
      );
      const previousLists = queryClient.getQueriesData({ queryKey: LIST_KEY });

      if (previousSingle) {
        queryClient.setQueryData<ApplicantDetail>(SINGLE_KEY(applicationId), {
          ...previousSingle,
          hiringStage: 'Rejected',
        });
      }

      return { previousSingle, previousLists };
    },

    onSuccess: (serverRecord, { applicationId }) => {
      queryClient.setQueryData<ApplicantDetail>(
        SINGLE_KEY(applicationId),
        mapApplicationRecordToApplicantDetail(serverRecord)
      );
      toast.success('Applicant rejected');
    },

    onError: (err, vars, ctx) => {
      if (ctx?.previousSingle) {
        queryClient.setQueryData(SINGLE_KEY(vars.applicationId), ctx.previousSingle);
      }
      if (ctx?.previousLists) {
        for (const [key, value] of ctx.previousLists) {
          queryClient.setQueryData(key, value);
        }
      }
      const message =
        err instanceof Error ? err.message : 'Failed to reject applicant';
      toast.error(message);
    },

    onSettled: (_data, _err, vars) => {
      void queryClient.invalidateQueries({ queryKey: SINGLE_KEY(vars.applicationId) });
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
