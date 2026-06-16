'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/socket-provider';
import { useUser } from '@/hooks/useUser';
import interviewPrepService, { 
  InterviewPreparation, 
  InterviewPrepStatus 
} from '@/services/interviewPrepService';
import { toast } from 'sonner';

export const useInterviewPrep = (jobId: number) => {
  const [data, setData] = useState<InterviewPreparation | null>(null);
  const [loading, setLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const { data: user } = useUser();

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
        toast.info('AI is generating your interview questions. This may take a few moments...');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start interview prep');
      setLoading(false);
    }
  };

  const regeneratePrep = async () => {
    setLoading(true);
    try {
      const prep = await interviewPrepService.regeneratePrep(jobId);
      setData(prep);
      toast.info('AI is regenerating your interview questions...');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to regenerate interview prep');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket && isConnected && user?.id) {
      const eventName = `INTERVIEW_PREP_READY_${jobId}_${user.id}`;
      
      const handleReady = (questions: any) => {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: InterviewPrepStatus.COMPLETED,
            questions,
          };
        });
        setLoading(false);
        toast.success('Interview preparation kit is ready!');
      };

      socket.on(eventName, handleReady);

      return () => {
        socket.off(eventName, handleReady);
      };
    }
  }, [socket, isConnected, jobId, user?.id]);

  return { 
    data, 
    loading, 
    fetchPrep, 
    startPrep, 
    regeneratePrep 
  };
};
