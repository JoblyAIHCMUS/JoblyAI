'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const DEBUG = true;
const logDebug = {
  info: (label: string, data?: unknown) => {
    if (DEBUG) console.log(`[NotificationsSocket] ${label}`, data || '');
  },
  warn: (label: string, data?: unknown) => {
    if (DEBUG) console.warn(`[NotificationsSocket] ⚠️  ${label}`, data || '');
  },
  error: (label: string, data?: unknown) => {
    if (DEBUG) console.error(`[NotificationsSocket] ❌ ${label}`, data || '');
  },
  success: (label: string, data?: unknown) => {
    if (DEBUG) console.log(`[NotificationsSocket] ✅ ${label}`, data || '');
  },
};

export interface UseNotificationsSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onNewNotification: (callback: (notification: Notification) => void) => void;
}

/**
 * Custom hook to manage WebSocket connection for real-time notifications
 */
export function useNotificationsSocket(): UseNotificationsSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const initializedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const notificationCallbackRef = useRef<
    ((notification: Notification) => void) | null
  >(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const socket = io(API_BASE_URL, {
      path: '/socket.io',
      reconnection: true,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (mountedRef.current) setIsConnected(true);
    });

    socket.on('disconnect', () => {
      if (mountedRef.current) setIsConnected(false);
    });

    socket.on('new_notification', (notification: Notification) => {
      logDebug.info('Received notification', notification);
      if (notificationCallbackRef.current) {
        notificationCallbackRef.current(notification);
      }
    });

    return () => {
      mountedRef.current = false;
      if (socket.connected) socket.disconnect();
    };
  }, []);

  const onNewNotification = useCallback(
    (callback: (notification: Notification) => void) => {
      notificationCallbackRef.current = callback;
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected,
    onNewNotification,
  };
}
