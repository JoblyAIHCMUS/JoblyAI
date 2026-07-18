'use client';

import { useState, useEffect, useCallback } from 'react';
import interviewPrepService, {
  InterviewPreparation,
  InterviewPrepStatus,
} from '@/services/interviewPrepService';
import { toast } from 'sonner';

export const useInterviewPrep = (jobId: number) => {
  const [data, setData] = useState<InterviewPreparation | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrep = useCallback(async () => {
    setLoading(true);
    try {
      const prep = await interviewPrepService.getPrep(jobId);
      setData(prep);
    } catch (error) {
      console.error('Failed to fetch interview prep:', error);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const startPrep = async () => {
    setLoading(true);
    try {
      const prep = await interviewPrepService.startPrep(jobId);
      setData(prep);
      if (prep.status === InterviewPrepStatus.COMPLETED) {
        setLoading(false);
      } else {
        toast.info(
          "AI is generating your interview questions. This process takes 30-60s. You can close the window; we'll notify you when it's done."
        );
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to start interview prep'
      );
      setLoading(false);
    }
  };

  const regeneratePrep = async () => {
    setLoading(true);
    try {
      const prep = await interviewPrepService.regeneratePrep(jobId);
      setData(prep);
      toast.info(
        "AI is regenerating your interview questions. This process takes 30-60s. You can close the window; we'll notify you when it's done."
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to regenerate interview prep'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleReady = (event: Event) => {
      const customEvent = event as CustomEvent<{
        jobId: number;
        questions: any;
      }>;
      if (
        customEvent.detail &&
        Number(customEvent.detail.jobId) === Number(jobId)
      ) {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: InterviewPrepStatus.COMPLETED,
            questions: customEvent.detail.questions,
          };
        });
        setLoading(false);
      }
    };

    const handleFailed = (event: Event) => {
      const customEvent = event as CustomEvent<{
        jobId: number;
        error?: string;
      }>;
      if (
        customEvent.detail &&
        Number(customEvent.detail.jobId) === Number(jobId)
      ) {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: InterviewPrepStatus.FAILED,
          };
        });
        setLoading(false);
      }
    };

    window.addEventListener('ai-interview-prep-ready', handleReady);
    window.addEventListener('ai-interview-prep-failed', handleFailed);

    return () => {
      window.removeEventListener('ai-interview-prep-ready', handleReady);
      window.removeEventListener('ai-interview-prep-failed', handleFailed);
    };
  }, [jobId]);

  return {
    data,
    loading,
    fetchPrep,
    startPrep,
    regeneratePrep,
  };
};
