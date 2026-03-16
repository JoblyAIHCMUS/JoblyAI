'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, SendMessageRequest } from '@/services/messagesService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Debug logging utility
const DEBUG = true;
const logDebug = {
  info: (label: string, data?: unknown) => {
    if (DEBUG) console.log(`[MessagesSocket] ${label}`, data || '');
  },
  warn: (label: string, data?: unknown) => {
    if (DEBUG) console.warn(`[MessagesSocket] ⚠️  ${label}`, data || '');
  },
  error: (label: string, data?: unknown) => {
    if (DEBUG) console.error(`[MessagesSocket] ❌ ${label}`, data || '');
  },
  success: (label: string, data?: unknown) => {
    if (DEBUG) console.log(`[MessagesSocket] ✅ ${label}`, data || '');
  },
};

export interface UseMessagesSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (recipientId: string, text: string) => void;
  onNewMessage: (callback: (message: ChatMessage) => void) => void;
  onMessageRead: (callback: (friendId: string) => void) => void;
}

/**
 * Custom hook to manage WebSocket connection for real-time messaging
 * Handles authentication via token in handshake headers
 */
export function useMessagesSocket(): UseMessagesSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const initializedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const messageCallbackRef = useRef<((message: ChatMessage) => void) | null>(
    null
  );
  const readCallbackRef = useRef<((friendId: string) => void) | null>(null);
  const mountedRef = useRef(true);

  // Initialize socket connection
  useEffect(() => {
    logDebug.info('Initializing WebSocket connection');

    // Prevent double initialization on React 18 Strict Mode
    if (initializedRef.current) {
      logDebug.info('Socket already initialized, skipping');
      return;
    }
    initializedRef.current = true;

    let socket: Socket | null = null;

    try {
      logDebug.info('Socket.io configuration', {
        apiUrl: API_BASE_URL,
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      // Initialize Socket.io client with withCredentials to send httpOnly cookies
      socket = io(API_BASE_URL, {
        path: '/socket.io',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling'],
        withCredentials: true, // Allow cookies to be sent with the request
      });

      logDebug.success('Socket.io client created');
      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        if (mountedRef.current) {
          logDebug.success('WebSocket connected', { socketId: socket?.id });
          setIsConnected(true);
        }
      });

      socket.on('disconnect', (reason: string) => {
        if (mountedRef.current) {
          logDebug.warn('WebSocket disconnected', { reason });
          setIsConnected(false);
        }
      });

      socket.on('connect_error', (error: Error) => {
        logDebug.error('WebSocket connection error', {
          message: error.message,
          name: error.name,
        });
      });

      socket.on('reconnect_attempt', (attemptNumber: number) => {
        logDebug.info('WebSocket reconnection attempt', {
          attempt: attemptNumber,
        });
      });

      socket.on('reconnect_failed', () => {
        logDebug.error(
          'WebSocket reconnection failed',
          'Max reconnection attempts reached'
        );
      });

      // Listen for new messages
      socket.on('new_message', (message: ChatMessage) => {
        logDebug.info('New message received', {
          senderId: message.senderId,
          contentLength: message.content?.length,
          timestamp: message.timestamp,
        });
        if (messageCallbackRef.current) {
          messageCallbackRef.current(message);
        }
      });

      // Listen for message read receipts
      socket.on('message_read', (data: { friendId: string; by?: string }) => {
        logDebug.info('Message read receipt received', data);
        if (readCallbackRef.current) {
          readCallbackRef.current(data.friendId);
        }
      });

      logDebug.success('All socket event listeners registered');

      return () => {
        logDebug.info('Cleaning up WebSocket connection');
        mountedRef.current = false;
        if (socket && socket.connected) {
          socket.disconnect();
        }
      };
    } catch (error) {
      logDebug.error('Error initializing WebSocket', {
        message: error instanceof Error ? error.message : String(error),
        error,
      });
      return () => {
        mountedRef.current = false;
      };
    }
  }, []);

  // Set mounted flag on mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Send message via WebSocket
  const sendMessage = useCallback((recipientId: string, text: string) => {
    logDebug.info('Send message requested', {
      recipientId,
      textLength: text.length,
      isConnected: socketRef.current?.connected,
    });

    if (!socketRef.current?.connected) {
      logDebug.error('WebSocket not connected, cannot send message', {
        connected: socketRef.current?.connected,
        socketExists: !!socketRef.current,
      });
      return;
    }

    const payload: SendMessageRequest = {
      recipientId,
      text,
    };

    logDebug.info('Emitting send_message event', { recipientId });

    // Emit 'send_message' event to backend
    socketRef.current.emit('send_message', payload, (response: unknown) => {
      if (response) {
        logDebug.success('Message sent successfully', response);
      } else {
        logDebug.warn('Message sent but no acknowledgment received');
      }
    });
  }, []);

  // Register callback for new messages
  const onNewMessage = useCallback(
    (callback: (message: ChatMessage) => void) => {
      messageCallbackRef.current = callback;
    },
    []
  );

  // Register callback for message read receipts
  const onMessageRead = useCallback((callback: (friendId: string) => void) => {
    readCallbackRef.current = callback;
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    onNewMessage,
    onMessageRead,
  };
}
