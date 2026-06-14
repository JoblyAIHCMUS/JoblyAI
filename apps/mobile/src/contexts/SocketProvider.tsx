import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import {
  getOrCreateSocket,
  emitSendMessage,
  emitMarkRead,
} from '../hooks/useMessagesSocket';
import {
  applyNewMessageToSummary,
  applyNewMessageToHistory,
  applyMessageReadToSummary,
} from './cacheUpdaters';
import type {
  ChatSummary,
  MarkReadAck,
  MessageReadEvent,
  NewMessageEvent,
  SendMessageAck,
} from '../types/message';

type NewMessageListener = (m: NewMessageEvent) => void;
type MessageReadListener = (d: MessageReadEvent) => void;

export interface SocketContextValue {
  socket: Socket;
  sendMessage: (
    recipientId: string,
    text: string,
    ack: (r: SendMessageAck) => void
  ) => void;
  markAsRead: (friendId: string, ack: (r: MarkReadAck) => void) => void;
  onNewMessage: (cb: NewMessageListener) => () => void;
  onMessageRead: (cb: MessageReadListener) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = getOrCreateSocket();
  const queryClient = useQueryClient();
  const newMessageListeners = useRef(new Set<NewMessageListener>());
  const messageReadListeners = useRef(new Set<MessageReadListener>());

  // ---- Wire raw socket events ONCE ------------------------------------
  useEffect(() => {
    const onNewMessage = (msg: NewMessageEvent) => {
      newMessageListeners.current.forEach((cb) => {
        try {
          cb(msg);
        } catch (e) {
          console.error('[ws] subscriber error', e);
        }
      });
      // Partial-key fan-out — we don't know the current userId, and the
      // summary's `participantId` matches `msg.senderId` (the OTHER party).
      queryClient.setQueriesData<ChatSummary[] | undefined>(
        { queryKey: ['chat-summary'] },
        (old) => applyNewMessageToSummary(old, msg)
      );
      queryClient.setQueryData(['chat-history', msg.chatId], (old: unknown) =>
        applyNewMessageToHistory(
          old as Parameters<typeof applyNewMessageToHistory>[0],
          msg
        )
      );
    };

    const onMessageRead = (data: MessageReadEvent) => {
      // Same partial-key fan-out: `friendId`/`by` matches the summary's `participantId`.
      const readBy = 'friendId' in data ? data.friendId : data.by;
      messageReadListeners.current.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[ws] subscriber error', e);
        }
      });
      queryClient.setQueriesData<ChatSummary[] | undefined>(
        { queryKey: ['chat-summary'] },
        (old) => {
          const prev = old?.find((c) => c.participantId === readBy)?.hasUnread;
          const result = applyMessageReadToSummary(old, readBy);
          const next = result?.find(
            (c) => c.participantId === readBy
          )?.hasUnread;
          console.log('[ws] message_read', { readBy, prev, next });
          return result;
        }
      );
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_read', onMessageRead);
    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_read', onMessageRead);
    };
  }, [socket, queryClient]);

  // ---- AppState → refetch summary on foreground ------------------------
  // No `socket.connected` guard: REST is independent of the socket.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        queryClient.invalidateQueries({ queryKey: ['chat-summary'] });
      }
    });
    return () => sub.remove();
  }, [queryClient]);

  const value: SocketContextValue = {
    socket,
    sendMessage: emitSendMessage,
    markAsRead: emitMarkRead,
    onNewMessage: (cb) => {
      newMessageListeners.current.add(cb);
      return () => {
        newMessageListeners.current.delete(cb);
      };
    },
    onMessageRead: (cb) => {
      messageReadListeners.current.add(cb);
      return () => {
        messageReadListeners.current.delete(cb);
      };
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used inside <SocketProvider>');
  }
  return ctx;
}
