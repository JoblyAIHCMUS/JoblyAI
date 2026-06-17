'use client';

import { useEffect } from 'react';
import { useSocket } from '@/contexts/socket-provider';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

/**
 * useAiSocket: Hook to listen for AI-related WebSocket events
 * @param userId - The current user's ID
 */
export const useAiSocket = (userId: string | undefined) => {
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ... (previous logging)
    if (!socket || !isConnected || !userId) {
      return;
    }

    const handleParsed = (data: { resumeId: number }) => {
      console.log(
        `[useAiSocket] 🎯 EVENT RECEIVED: RESUME_PARSED_${userId}`,
        data
      );

      // Dispatch custom event to notify components that AI has finished
      window.dispatchEvent(
        new CustomEvent('ai-parsed-success', { detail: data })
      );

      toast.success('Resume parsed successfully!', {
        id: `ai-parsed-success-${data.resumeId}`,
        description:
          'AI has finished reading your CV. Review and sync to your profile now.',
        duration: 10000,
        action: {
          label: 'Review',
          onClick: () => {
            if (pathname === '/candidate/profile') {
              window.dispatchEvent(
                new CustomEvent('OPEN_CV_SYNC_MODAL', {
                  detail: { resumeId: data.resumeId },
                })
              );
            } else {
              router.push(`/candidate/profile?openSyncModal=${data.resumeId}`);
            }
          },
        },
      });
    };

    const handleScored = (data: { resumeId: number }) => {
      console.log('[useAiSocket] RESUME_SCORED received', data);

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent('ai-scored-success', { detail: data })
      );

      toast.success('AI Scoring complete!', {
        id: `ai-scored-success-${data.resumeId}`,
        description: 'Your CV has been evaluated with a strategic score.',
        duration: 8000,
        action: {
          label: 'View Feedback',
          onClick: () => {
            if (pathname === '/candidate/profile') {
              window.dispatchEvent(
                new CustomEvent('OPEN_AI_FEEDBACK_MODAL', {
                  detail: { resumeId: data.resumeId },
                })
              );
            } else {
              router.push(
                `/candidate/profile?openFeedbackModal=${data.resumeId}`
              );
            }
          },
        },
      });
    };

    const handleInterviewPrepReady = (data: { jobId: number; questions: any }) => {
      console.log('[useAiSocket] 🎯 EVENT RECEIVED: INTERVIEW_PREP_READY', data);
      
      // Dispatch a generic event for any component interested (like the modal)
      window.dispatchEvent(
        new CustomEvent('ai-interview-prep-ready', { detail: data })
      );

      toast.success('Interview Prep Kit Ready!', {
        description: 'Your personalized interview preparation kit has been generated.',
        duration: 10000,
        action: {
          label: 'View Kit',
          onClick: () => {
            const jobPath = `/find-jobs/${data.jobId}`;
            console.log('[useAiSocket] Toast action clicked', { currentPath: pathname, targetPath: jobPath });
            
            // If already on the page, just trigger the modal
            if (pathname.includes(jobPath)) {
              console.log('[useAiSocket] Already on page, dispatching OPEN_INTERVIEW_PREP_MODAL');
              window.dispatchEvent(
                new CustomEvent('OPEN_INTERVIEW_PREP_MODAL', {
                  detail: { jobId: data.jobId },
                })
              );
            } else {
              // Redirect and use query param to auto-open
              const redirectPath = pathname.startsWith('/candidate') 
                ? `/candidate/find-jobs/${data.jobId}?openPrep=true` 
                : `/find-jobs/${data.jobId}?openPrep=true`;
              console.log('[useAiSocket] Redirecting to:', redirectPath);
              router.push(redirectPath);
            }
          },
        },
      });
    };

    // Events match the AiGateway implementation
    socket.on(`RESUME_PARSED_${userId}`, handleParsed);
    socket.on(`RESUME_SCORED_${userId}`, handleScored);
    socket.on(`INTERVIEW_PREP_READY_${userId}`, handleInterviewPrepReady);

    return () => {
      socket.off(`RESUME_PARSED_${userId}`, handleParsed);
      socket.off(`RESUME_SCORED_${userId}`, handleScored);
      socket.off(`INTERVIEW_PREP_READY_${userId}`, handleInterviewPrepReady);
    };
  }, [socket, isConnected, userId, pathname, router]);
};
