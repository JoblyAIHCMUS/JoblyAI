'use client';

import { createContext, useContext, ReactNode, useRef, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useMessagesSocket } from '@/hooks/useMessagesSocket';
import { SocketChatMessage } from '@/api-client/messages';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  sendMessage: (recipientId: string, text: string) => void;
  markAsRead: (recipientId: string) => Promise<void>;
  onNewMessage: (callback: (message: SocketChatMessage) => void) => () => void;
  onMessageRead: (callback: (friendId: string) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

/**
 * SocketProvider: Centralized socket management for the entire app
 * Ensures a single WebSocket connection is shared across all components
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const socketReturn = useMessagesSocket();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  // Support multiple subscribers
  const messageCallbacksRef = useRef(new Set<(m: SocketChatMessage) => void>());
  const readCallbacksRef = useRef(new Set<(id: string) => void>());

  // Register callbacks from useMessagesSocket
  useEffect(() => {
    // Register our refs with the socket callbacks
    socketReturn.onNewMessage((message) => {
      // Debug: number of registered subscribers

      console.debug(
        '[SocketProvider] new_message received, subscribers=',
        messageCallbacksRef.current.size,
        message
      );
      messageCallbacksRef.current.forEach((cb) => {
        try {
          cb(message);
        } catch (err) {
          // swallow subscriber errors to avoid breaking others
          console.error('SocketProvider subscriber error (new_message)', err);
        }
      });
    });

    socketReturn.onMessageRead((friendId) => {
      readCallbacksRef.current.forEach((cb) => {
        try {
          cb(friendId);
        } catch (err) {
          console.error('SocketProvider subscriber error (message_read)', err);
        }
      });
    });
  }, [socketReturn]);

  // Context value with callback registration functions
  const value: SocketContextType = {
    socket: socketReturn.socket,
    isConnected: socketReturn.isConnected,
    activeChatId,
    setActiveChatId,
    sendMessage: socketReturn.sendMessage,
    markAsRead: socketReturn.markAsRead,
    onNewMessage: (callback) => {
      messageCallbacksRef.current.add(callback);
      return () => {
        messageCallbacksRef.current.delete(callback);
      };
    },
    onMessageRead: (callback) => {
      readCallbacksRef.current.add(callback);
      return () => {
        readCallbacksRef.current.delete(callback);
      };
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

/**
 * Hook to access the shared socket instance and methods
 * Must be called within a component that's wrapped by SocketProvider
 */
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
