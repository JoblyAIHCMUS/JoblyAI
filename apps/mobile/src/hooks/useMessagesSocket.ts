import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../lib/api-base';
import { getSessionCookieHeader } from '../lib/session-cookie';
import type {
  MarkReadAck,
  NewMessageEvent,
  MessageReadEvent,
} from '../types/message';
import type { SendMessageAck } from '../types/message';

let _socket: Socket | null = null;
let currentChatId: string | null = null;

export function getOrCreateSocket(): Socket {
  if (_socket) return _socket;

  // API_BASE_URL ends in `/api` for REST; socket.io treats it as a namespace, so strip it.
  const wsBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  console.log('[ws] init', { restUrl: API_BASE_URL, wsUrl: wsBaseUrl });

  _socket = io(wsBaseUrl, {
    path: '/socket.io',
    withCredentials: false,
    // RN can't do HTTP long-polling.
    transports: ['websocket'],
    // Function form re-reads the cookie per connect; static form freezes the empty module-init value.
    auth: async (cb) => {
      const cookie = await getSessionCookieHeader();
      console.log('[ws] auth', { hasCookie: !!cookie });
      cb({ cookie });
    },

    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });

  _socket.on('connect', () => {
    console.log('[ws] connect', {
      id: _socket?.id,
    });

    if (currentChatId) {
      console.log('[ws] restore active chat', {
        chatId: currentChatId,
      });

      _socket?.emit('chat_opened', {
        chatId: currentChatId,
      });
    }
  });
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

export function disconnectSocket(): void {
  _socket?.disconnect();
  _socket = null;
  currentChatId = null;
}

export function getExistingSocket(): Socket | null {
  return _socket;
}

// For testing/cleanup only — production code should never call this.
export function _resetSocketForTests(): void {
  disconnectSocket();
}

// Typed emit helpers — keep the rest of the codebase from importing
// socket.io-client directly or casting payloads.
export function emitSendMessage(
  recipientId: string,
  text: string,
  ack: (response: SendMessageAck) => void
): void {
  const socket = getExistingSocket();
  if (!socket) {
    ack({ status: 'error', error: 'socket_disconnected' });
    return;
  }
  socket.emit('send_message', { recipientId, text }, ack);
}

export function emitMarkRead(
  friendId: string,
  ack: (response: MarkReadAck) => void
): void {
  const socket = getExistingSocket();
  if (!socket) {
    ack({ status: 'error', error: 'socket_disconnected' });
    return;
  }
  console.log('[ws] emit mark_read', { friendId, connected: socket.connected });
  socket.emit('mark_read', { friendId }, ack);
}

export function emitChatOpened(chatId: string) {
  currentChatId = chatId;
  getExistingSocket()?.emit('chat_opened', { chatId });
}

export function emitChatClosed() {
  currentChatId = null;

  getExistingSocket()?.emit('chat_closed');
}

export type { NewMessageEvent, MessageReadEvent };
