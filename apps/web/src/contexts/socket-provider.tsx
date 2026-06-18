'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { getOrCreateSocket } from '@/hooks/useMessagesSocket';
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket';
import {
  applyNewMessageToSummary,
  applyMessageReadToSummary,
  applyNewMessageToHistory,
} from '@/lib/query/cacheUpdaters';
import type {
  ChatSummary,
  ChatMessage,
  NewMessageEvent,
  MessageReadEvent,
} from '@/api-client/messages/types';
import type { Notification } from '@/types/notification';

type NewMessageListener = (msg: NewMessageEvent) => void;
type MessageReadListener = (readBy: string) => void;
type NotificationListener = (n: Notification) => void;

interface SocketContextValue {
  socket: Socket;
  isConnected: boolean;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  onNewMessage: (cb: NewMessageListener) => () => void;
  onMessageRead: (cb: MessageReadListener) => () => void;
  onNewNotification: (cb: NotificationListener) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

/**
 * SocketProvider: Centralized socket management for the entire app.
 * Owns the messages WebSocket singleton (via getOrCreateSocket) and runs the
 * React Query cache bus — every raw 'new_message' / 'message_read' event is
 * written into the ['chat-summary'] / ['chat-history'] cache. Notifications
 * are kept on a separate connection (per spec §6) and fanned out via
 * onNewNotification for legacy consumers.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const socket = useMemo(() => getOrCreateSocket(), []);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const newMessageListeners = useRef(new Set<NewMessageListener>());
  const messageReadListeners = useRef(new Set<MessageReadListener>());
  const notificationListeners = useRef(new Set<NotificationListener>());

  // Messages: cache bus + raw socket subscriptions.
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onNewMessage = (msg: NewMessageEvent) => {
      for (const cb of newMessageListeners.current) {
        try {
          cb(msg);
        } catch (e) {
          console.error('[ws] subscriber error', e);
        }
      }
      queryClient.setQueriesData({ queryKey: ['chat-summary'] }, (old) =>
        applyNewMessageToSummary(old as ChatSummary[] | undefined, msg)
      );
      queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
        ['chat-history', msg.chatId],
        (old) => applyNewMessageToHistory(old, msg)
      );
    };
    const onMessageRead = (data: MessageReadEvent) => {
      const readBy = 'friendId' in data ? data.friendId : data.by;
      for (const cb of messageReadListeners.current) {
        try {
          cb(readBy);
        } catch (e) {
          console.error('[ws] subscriber error', e);
        }
      }
      queryClient.setQueriesData({ queryKey: ['chat-summary'] }, (old) =>
        applyMessageReadToSummary(old as ChatSummary[] | undefined, readBy)
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', onNewMessage);
    socket.on('message_read', onMessageRead);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      socket.off('message_read', onMessageRead);
    };
  }, [socket, queryClient]);

  // Foreground / focus → invalidate ['chat-summary'].
  useEffect(() => {
    const invalidate = () => {
      if (document.visibilityState === 'visible' || document.hasFocus()) {
        queryClient.invalidateQueries({ queryKey: ['chat-summary'] });
      }
    };
    document.addEventListener('visibilitychange', invalidate);
    window.addEventListener('focus', invalidate);
    return () => {
      document.removeEventListener('visibilitychange', invalidate);
      window.removeEventListener('focus', invalidate);
    };
  }, [queryClient]);

  // Notifications: separate socket, fan-out only.
  const notificationSocketReturn = useNotificationsSocket();
  useEffect(() => {
    notificationSocketReturn.onNewNotification((notification) => {
      for (const cb of notificationListeners.current) {
        try {
          cb(notification);
        } catch (e) {
          console.error('[ws] subscriber error', e);
        }
      }
    });
  }, [notificationSocketReturn]);

  const onNewMessageSub = useCallback((cb: NewMessageListener) => {
    newMessageListeners.current.add(cb);
    return () => {
      newMessageListeners.current.delete(cb);
    };
  }, []);
  const onMessageReadSub = useCallback((cb: MessageReadListener) => {
    messageReadListeners.current.add(cb);
    return () => {
      messageReadListeners.current.delete(cb);
    };
  }, []);
  const onNewNotificationSub = useCallback((cb: NotificationListener) => {
    notificationListeners.current.add(cb);
    return () => {
      notificationListeners.current.delete(cb);
    };
  }, []);

  const value: SocketContextValue = {
    socket,
    isConnected,
    activeChatId,
    setActiveChatId,
    onNewMessage: onNewMessageSub,
    onMessageRead: onMessageReadSub,
    onNewNotification: onNewNotificationSub,
  };
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used inside <SocketProvider>');
  }
  return ctx;
}
