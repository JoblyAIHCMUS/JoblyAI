'use client';

import { useEffect } from 'react';
import { useSocket } from '@/contexts/socket-provider';
import { toast } from 'sonner';

/**
 * useAiSocket: Hook to listen for AI-related WebSocket events
 * @param userId - The current user's ID
 */
export const useAiSocket = (userId: string | undefined) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    console.log('[useAiSocket] Effect triggered', { 
      socketExists: !!socket, 
      isConnected, 
      userId 
    });

    if (!socket || !isConnected || !userId) {
      return;
    }

    const parseEvent = `RESUME_PARSED_${userId}`;
    const scoreEvent = `RESUME_SCORED_${userId}`;

    console.log(`[useAiSocket] ✅ Registering listeners:`, { parseEvent, scoreEvent });

    const handleParsed = (data: { resumeId: number }) => {
      console.log(`[useAiSocket] 🎯 EVENT RECEIVED: ${parseEvent}`, data);
      
      // Dismiss the processing toast if it exists
      toast.dismiss('ai-processing');

      // Dispatch custom event to notify components that AI has finished
      window.dispatchEvent(new CustomEvent('ai-parsed-success', { detail: data }));

      toast.success('Resume parsed successfully!', {
        id: 'ai-parsed-success',
        description: 'AI has finished reading your CV. Review and sync to your profile now.',
        duration: 10000,
        action: {
          label: 'Review',
          onClick: () => {
            window.dispatchEvent(
              new CustomEvent('OPEN_CV_SYNC_MODAL', { 
                detail: { resumeId: data.resumeId } 
              })
            );
          },
        },
      });
    };

    const handleScored = (data: { resumeId: number }) => {
      console.log('[useAiSocket] RESUME_SCORED received', data);
      
      // Dismiss the processing toast
      toast.dismiss('ai-processing');

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('ai-scored-success', { detail: data }));

      toast.success('AI Scoring complete!', {
        description: 'Your CV has been evaluated with a strategic score.',
        duration: 8000,
        action: {
          label: 'View Feedback',
          onClick: () => {
            window.dispatchEvent(
              new CustomEvent('OPEN_AI_FEEDBACK_MODAL', { 
                detail: { resumeId: data.resumeId } 
              })
            );
          },
        },
      });
    };

    // Events match the AiGateway implementation
    socket.on(`RESUME_PARSED_${userId}`, handleParsed);
    socket.on(`RESUME_SCORED_${userId}`, handleScored);

    return () => {
      socket.off(`RESUME_PARSED_${userId}`, handleParsed);
      socket.off(`RESUME_SCORED_${userId}`, handleScored);
    };
  }, [socket, isConnected, userId]);
};
