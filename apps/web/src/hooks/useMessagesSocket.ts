'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, SendMessageRequest } from '@/services/messagesService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  const [isConnected, setIsConnected] = useState(false);
  const messageCallbackRef = useRef<((message: ChatMessage) => void) | null>(
    null
  );
  const readCallbackRef = useRef<((friendId: string) => void) | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Extract token from cookies
    const getTokenFromCookie = (): string | null => {
      const cookies = document.cookie.split('; ');
      const sessionCookie = cookies.find((c) =>
        c.startsWith('better-auth.session-token=')
      );
      return sessionCookie ? sessionCookie.split('=')[1] : null;
    };

    const token = getTokenFromCookie();

    // Skip connection if no token
    if (!token) {
      console.warn('No auth token found, WebSocket will not connect');
      return undefined;
    }

    let socket: Socket | null = null;

    try {
      // Initialize Socket.io client with auth token in handshake headers
      socket = io(API_BASE_URL, {
        path: '/socket.io',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling'],
        extraHeaders: {
          Authorization: `Bearer ${token}`,
          Cookie: `better-auth.session-token=${token}`,
        },
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('WebSocket connected:', socket?.id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error: Error) => {
        console.error('WebSocket connection error:', error);
      });

      // Listen for new messages
      socket.on('new_message', (message: ChatMessage) => {
        console.log('New message received:', message);
        if (messageCallbackRef.current) {
          messageCallbackRef.current(message);
        }
      });

      // Listen for message read receipts
      socket.on('message_read', (data: { friendId: string }) => {
        console.log('Message read receipt:', data);
        if (readCallbackRef.current) {
          readCallbackRef.current(data.friendId);
        }
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      return undefined;
    }
  }, []);

  // Send message via WebSocket
  const sendMessage = useCallback((recipientId: string, text: string) => {
    if (!socketRef.current?.connected) {
      console.error('WebSocket not connected, cannot send message');
      return;
    }

    const payload: SendMessageRequest = {
      recipientId,
      text,
    };

    // Emit 'send_message' event to backend
    socketRef.current.emit('send_message', payload, (response: unknown) => {
      if (response) {
        console.log('Message sent successfully:', response);
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
