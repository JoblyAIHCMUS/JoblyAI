'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  type ApplicationRecord,
  getCandidateApplicationById,
} from '@/api-client/application';
import type { JobPosting } from '@/api-client/jobs/types';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 6;

interface UsePostSubmitEligibilityOptions {
  job: JobPosting;
  onEligible: (record: ApplicationRecord) => void;
  onNotEligible: () => void;
}

export function usePostSubmitEligibility({
  job,
  onEligible,
  onNotEligible,
}: UsePostSubmitEligibilityOptions) {
  const [isPolling, setIsPolling] = useState(false);
  const cancelledRef = useRef(false);
  const pollingIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const handleApplicationSuccess = useCallback(
    (record: ApplicationRecord) => {
      if (
        record.status === 'PRE_SHORTLIST_PENDING' &&
        record.preShortlistQuestionsCount > 0
      ) {
        onEligible(record);
        return;
      }

      const jobHasPreShortlist =
        job.preShortlistEnabled && (job.preShortlistQuestions?.length ?? 0) > 0;

      if (record.status === 'APPLIED' && jobHasPreShortlist) {
        pollingIdRef.current = record.id;
        cancelledRef.current = false;
        setIsPolling(true);
        const checkingToast = toast.loading(
          'Checking your pre-shortlist eligibility...'
        );
        void pollEligibility(record.id, checkingToast);
        return;
      }

      onNotEligible();
    },
    [job, onEligible, onNotEligible]
  );

  const pollEligibility = useCallback(
    async (applicationId: number, checkingToast: string | number) => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

        if (cancelledRef.current || pollingIdRef.current !== applicationId) {
          toast.dismiss(checkingToast);
          return;
        }

        try {
          const updated = await getCandidateApplicationById(applicationId);

          if (pollingIdRef.current !== applicationId) {
            toast.dismiss(checkingToast);
            return;
          }

          if (
            updated.status === 'PRE_SHORTLIST_PENDING' &&
            updated.preShortlistQuestionsCount > 0
          ) {
            toast.dismiss(checkingToast);
            setIsPolling(false);
            onEligible(updated);
            return;
          }

          if (updated.status !== 'APPLIED') {
            toast.dismiss(checkingToast);
            setIsPolling(false);
            onNotEligible();
            return;
          }
        } catch (error) {
          console.error('Eligibility poll failed', error);
        }
      }

      if (cancelledRef.current || pollingIdRef.current !== applicationId) {
        toast.dismiss(checkingToast);
        return;
      }

      toast.dismiss(checkingToast);
      setIsPolling(false);
      onNotEligible();
    },
    [onEligible, onNotEligible]
  );

  return { handleApplicationSuccess, isPolling };
}
