// apps/web/src/hooks/useMessagesSocket.ts
import { useMemo } from 'react';
import { io, type Socket } from 'socket.io-client';
import type {
  SendMessageRequest,
  SendMessageAck,
  MarkReadAck,
} from '@/api-client/messages/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TEN_SECONDS_MS = 10_000;

let _socket: Socket | null = null;

export function getOrCreateSocket(): Socket {
  if (_socket) return _socket;
  console.log('[ws] init', { restUrl: API_BASE_URL });
  _socket = io(API_BASE_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });
  _socket.on('connect', () => console.log('[ws] connect', { id: _socket?.id }));
  _socket.on('disconnect', (reason) =>
    console.log('[ws] disconnect', { reason })
  );
  _socket.on('connect_error', (err) =>
    console.log('[ws] connect_error', { msg: err.message })
  );
  _socket.on('reconnect', (attempt) =>
    console.log('[ws] reconnect', { attempt })
  );
  _socket.on('reconnect_attempt', (attempt) =>
    console.log('[ws] reconnect_attempt', { attempt })
  );
  _socket.on('reconnect_error', (err) =>
    console.log('[ws] reconnect_error', { msg: err.message })
  );
  _socket.on('reconnect_failed', () => console.log('[ws] reconnect_failed'));
  return _socket;
}

export function emitSendMessage(
  dto: SendMessageRequest
): Promise<SendMessageAck> {
  const socket = getOrCreateSocket();
  return new Promise<SendMessageAck>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('send_timeout_emitter')),
      TEN_SECONDS_MS
    );
    socket.emit('send_message', dto, (response: unknown) => {
      clearTimeout(timer);
      resolve(response as SendMessageAck);
    });
  });
}

export function emitMarkRead(friendId: string): Promise<MarkReadAck> {
  const socket = getOrCreateSocket();
  console.log('[ws] emit mark_read', { friendId, connected: socket.connected });
  return new Promise<MarkReadAck>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('mark_read_timeout_emitter')),
      TEN_SECONDS_MS
    );
    socket.emit('mark_read', { friendId }, (response: unknown) => {
      clearTimeout(timer);
      resolve(response as MarkReadAck);
    });
  });
}

// Compat shim — returns the singleton via a stable reference. Does NOT expose
// `isConnected` because socket.connected is non-reactive; the reactive value
// lives in SocketProvider (via useState that tracks the singleton's
// connect/disconnect events). After this PR lands, all real consumers should
// use useSocket() from SocketProvider.
export function useMessagesSocket(): { socket: Socket } {
  const socket = useMemo(() => getOrCreateSocket(), []);
  return { socket };
}
