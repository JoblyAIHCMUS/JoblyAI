import { io, Socket } from 'socket.io-client';
import { authClient } from '../lib/auth-client';
import { API_BASE_URL } from '../lib/api-base';
import type {
  MarkReadAck,
  NewMessageEvent,
  MessageReadEvent,
  SendMessageAck,
} from '../types/message';

let _socket: Socket | null = null;

export function getOrCreateSocket(): Socket {
  if (_socket) return _socket;

  _socket = io(API_BASE_URL, {
    path: '/socket.io',

    // RN does not support HTTP long-polling; force the websocket transport.
    // (The server still upgrades polling→websocket on its own when called
    //  from a browser; on RN we skip the polling phase entirely.)
    transports: ['websocket'],

    // RN's socket.io-client does NOT auto-attach cookies on the WS upgrade
    // request the way browsers do. We pass the better-auth session cookie
    // explicitly via `auth`, and the backend merges it into the headers it
    // passes to authService.validateToken.
    auth: { cookie: authClient.getCookie() ?? '' },

    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });

  return _socket;
}

// For testing/cleanup only — production code should never call this.
export function _resetSocketForTests(): void {
  _socket?.disconnect();
  _socket = null;
}

// Typed emit helpers — these keep the rest of the codebase from importing
// socket.io-client directly and from casting payloads.
export function emitSendMessage(
  recipientId: string,
  text: string,
  ack: (response: SendMessageAck) => void,
): void {
  getOrCreateSocket().emit('send_message', { recipientId, text }, ack);
}

export function emitMarkRead(
  friendId: string,
  ack: (response: MarkReadAck) => void,
): void {
  getOrCreateSocket().emit('mark_read', { friendId }, ack);
}

export type { NewMessageEvent, MessageReadEvent };
