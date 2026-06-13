# Messaging System Architecture

## Overview

Hybrid REST + WebSocket (Socket.IO) real-time chat with dual-database persistence. Conversation metadata lives in **PostgreSQL** (via Prisma), while messages are stored in **ScyllaDB** (Cassandra-compatible) for high-write throughput and time-series querying.

Three clients share the same backend:

- **Web** (`apps/web`, Next.js) — two legacy parallel Socket.IO connections wrapped in a single `SocketProvider`, raw `useState` + `axios`, no React Query
- **Mobile** (`apps/mobile`, Expo / React Native) — **single persistent Socket.IO connection** managed by a `SocketProvider`, **React Query** as the cache and bus for `chat-summary` and `chat-history`, optimistic send with `local-{uuid}` → real `messageId` swap on server ack, RN-specific WS config (forced `websocket` transport, explicit `auth.cookie` for the WS upgrade)
- **Backend** (`apps/backend`, NestJS) — three Socket.IO gateways (`messages`, `notifications`, `ai`); the messages gateway emits `new_message` to BOTH recipient and sender rooms for multi-device sync

The mobile implementation brings the conversation list, chat detail, mark-as-read, real-time messaging, unread badge, and conversation initiation to feature parity with the web, and applies targeted fixes to documented web smells (sender-self-echo duplication, no React Query for messages).

---

## 1. Data Model

### 1a. PostgreSQL — Conversation Metadata

**File:** `apps/backend/prisma/schema.prisma:51-66`

```prisma
model Conversation {
  id            Int      @id @default(autoincrement())
  ownerId       String
  owner         User     @relation("UserConversations", fields: [ownerId], references: [id])
  participantId String
  participant   User     @relation("ParticipantInConversations", fields: [participantId], references: [id])
  lastMessage   String?
  lastMessageAt DateTime @default(now())
  scyllaChatId  String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([ownerId, participantId])
  @@index([ownerId, lastMessageAt(sort: Desc)])
}
```

Key design: each user gets their **own row** for the same conversation. When A and B chat, two rows exist — `{ownerId: A, participantId: B}` and `{ownerId: B, participantId: A}` — sharing the same `scyllaChatId`. The `@@unique` constraint prevents duplicates.

### 1b. ScyllaDB — Messages (Cassandra)

Keyspace: `chat_app` (see `apps/backend/src/lib/db.ts:20-24`)

```cql
CREATE TABLE messages (
  chat_id    text,
  message_id timeuuid,
  sender_id  text,
  content    text,
  PRIMARY KEY (chat_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

CREATE TABLE last_seen (
  user_id   text,
  chat_id   text,
  last_read timeuuid,
  PRIMARY KEY (user_id, chat_id)
);
```

- `chat_id` — deterministic composite key: `[userA, userB].sort().join(':')` (`messages.service.ts:15-17`)
- `message_id` — `TimeUuid` encoding the exact timestamp, enabling chronological ordering without a separate timestamp column
- `last_seen` tracks per-user read position for unread detection

### 1c. Backend Interfaces

**File:** `apps/backend/src/app/messages/messages.interface.ts`

```typescript
interface ChatSummaryResponse {
  chatId: string;
  participantId: string;
  participantName: string | null;
  participantRole: string | null;
  participantAvatar: string | null;
  latestMessage: string | null;
  hasUnread: boolean;
  lastMessageAt: Date;
  isActive: boolean;
}

interface ChatHistoryResponse {
  messages: {
    messageId: string;
    senderId: string;
    senderAvatar?: string | null;
    senderName?: string | null;
    content: string;
    timestamp: Date;
  }[];
}
```

### 1d. Frontend Types

**File:** `apps/web/src/api-client/messages/types.ts` (API layer)

```typescript
interface ChatSummary {
  chatId;
  participantId;
  participantName;
  participantRole;
  participantAvatar;
  latestMessage;
  hasUnread;
  lastMessageAt;
  isActive;
}
interface ChatMessage {
  messageId;
  senderId;
  senderAvatar?;
  senderName?;
  content;
  timestamp;
}
interface SocketChatMessage {
  senderId;
  content;
  timestamp;
}
interface SendMessageRequest {
  recipientId;
  text;
}
```

**File:** `apps/web/src/features/employer/messages/types.ts` (UI layer)

```typescript
interface Conversation {
  chatId;
  participantId;
  name;
  role;
  avatar;
  lastMessage;
  timestamp;
  unread;
  isActive;
  lastMessageAt;
}
interface Message {
  messageId;
  senderId;
  sender;
  senderAvatar;
  isSent;
  content;
  timestamp;
  timestamp24;
  showDateSeparator?;
  dateLabel?;
}
```

**File:** `apps/mobile/src/types/message.ts` (mobile shared REST + WS wire types)

```typescript
// REST (mirrors the backend ChatSummaryResponse / ChatHistoryResponse)
interface ChatSummary {
  chatId;
  participantId;
  participantName;
  participantRole;
  participantAvatar;
  latestMessage;
  hasUnread;
  lastMessageAt;
  isActive;
}
interface ChatMessage {
  messageId;
  senderId;
  senderAvatar?;
  senderName?;
  content;
  timestamp;
}
interface ChatHistoryResponse {
  messages: ChatMessage[];
}

// WebSocket wire
interface NewMessageEvent {
  chatId;
  messageId;
  senderId;
  content;
  timestamp;
}
type MessageReadEvent = { friendId: string } | { by: string };
interface SendMessageRequest {
  recipientId;
  text;
}
type SendMessageAck =
  | { status: 'ok'; messageId: string; timestamp: string }
  | { status: 'error'; error: string };
type MarkReadAck =
  | { status: 'ok'; lastReadAt: string }
  | { status: 'error'; error: string };
```

**File:** `apps/mobile/src/app/pages/employer/messages/types.ts` (mobile UI layer)

```typescript
interface Conversation {
  chatId;
  participantId;
  name;
  role;
  avatar;
  lastMessage;
  timestamp;
  unread;
  isActive;
  lastMessageAt;
}
interface Message {
  messageId;
  senderId;
  sender;
  senderAvatar;
  isSent;
  content;
  timestamp;
  timestamp24;
  showDateSeparator?;
  dateLabel?;
}
```

---

## 2. REST API

### 2a. Backend Controller

**File:** `apps/backend/src/app/messages/messages.controller.ts`

All endpoints are prefixed with `/chats` and protected by `@UseGuards(AuthGuard)`.

| Method | Endpoint                            | Purpose                                           |
| ------ | ----------------------------------- | ------------------------------------------------- |
| `GET`  | `/chats/summary?userId=`            | All conversations with unread status              |
| `GET`  | `/chats/history/:friendId?limit=50` | Message history with a specific user              |
| `POST` | `/chats/read/:friendId`             | Mark conversation as read                         |
| `POST` | `/chats/init/:friendId`             | Initialize a new conversation (idempotent upsert) |

### 2b. Frontend API Client

**File:** `apps/web/src/api-client/messages/public.ts`

Axios-based client calling the NestJS backend directly (no Next.js API route proxy):

```typescript
getChatSummary(userId)       → GET /api/chats/summary?userId=
getChatHistory(friendId, 50) → GET /api/chats/history/:friendId
markChatRead(friendId)       → POST /api/chats/read/:friendId
initConversation(friendId)   → POST /api/chats/init/:friendId
```

**File:** `apps/mobile/src/api/messages.ts`

```typescript
export async function getChatSummary(userId: string): Promise<ChatSummary[]>;
export async function getChatHistory(
  friendId: string,
  limit = 50
): Promise<ChatHistoryResponse>;
export async function initConversation(
  friendId: string
): Promise<{ chatId: string }>;
```

Both use the shared `apiClient` (axios + `withCredentials: true` + a request interceptor that attaches the Better Auth session cookie from SecureStore on mobile, or from the browser cookie jar on web).

---

## 3. WebSocket (Real-Time)

### 3a. Backend Gateway

**File:** `apps/backend/src/app/messages/messages.gateway.ts`

NestJS `@WebSocketGateway()` with no namespace — default Socket.IO path.

**Connection authentication** (lines 31-49):

- Reads headers from `client.handshake.headers` and clones them
- **NEW (mobile-compat):** if the client is a React Native app, it sends the session via `client.handshake.auth.cookie` instead of an upgrade header. The gateway merges `auth.cookie` into `headers.cookie` only if `headers.cookie` is absent — browsers still take precedence
- Validates session via `authService.validateToken(headers)`
- On success, user joins a **Socket.IO room named by their user ID** (`client.join(userId)`)
- On failure, client is disconnected — no anonymous connections

**Events:**

| Event          | Handler                           | Description                                                                                                                                                       |
| -------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `send_message` | `handleSendMessage` (lines 65-81) | Receives `SendMessageDTO`, persists to ScyllaDB, returns `{ status: 'ok', messageId, timestamp }` ack, emits `new_message` to **both** recipient and sender rooms |
| `mark_read`    | `handleMarkRead` (lines 83-93)    | Persists `last_read` timestamp, returns `{ status: 'ok', lastReadAt }` ack, emits `message_read` to both participants                                             |

Both handlers are wrapped in `try/catch` and return `{ status: 'error', error: <message> }` on failure (no longer throw — clients get a typed error on the ack callback).

```typescript
// send_message flow (lines 65-81)
@SubscribeMessage('send_message')
async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageDTO) {
  const senderId = client.data.userId as string;
  try {
    const { messageId, timestamp } = await this.messagesService.sendMessage(senderId, dto);
    const chatId = MessagesService.getChatId(senderId, dto.recipientId);
    const payload = { chatId, messageId, senderId, content: dto.text, timestamp };

    // Recipient (existing behavior)
    this.server.to(dto.recipientId).emit('new_message', payload);

    // Sender (NEW) — multi-device sync. The same payload; the client de-dupes
    // by messageId so a sender with the chat open on this device won't see
    // a duplicate of the optimistic message they just sent.
    this.server.to(senderId).emit('new_message', payload);

    return { status: 'ok', messageId, timestamp };
  } catch (e) {
    return { status: 'error', error: (e as Error).message };
  }
}
```

The `new_message` payload now includes **`chatId`**, **`messageId`**, **`senderId`**, **`content`**, and **`timestamp`** (ISO string). The web client ignores `chatId` and `messageId`; the mobile client uses both for de-dup and cache routing.

### 3b. Frontend WebSocket Hooks (web)

There are **two parallel Socket.IO client connections** to the same backend (same `path: /socket.io`, same base URL, both `withCredentials: true`). They are wrapped together by a single `SocketProvider` (see §3c) but are technically two independent connections on the wire.

**Messages socket — File:** `apps/web/src/hooks/useMessagesSocket.ts`

- Creates Socket.IO client with `withCredentials: true`, transports `['websocket', 'polling']`
- Auto-reconnection: up to 10 attempts, 1s–5s backoff
- Event listeners: `connect`, `disconnect`, `connect_error`, `new_message`, `message_read`
- `sendMessage(recipientId, text)` — emits `send_message` event (lines 168-198); silently no-ops if disconnected
- `markAsRead(recipientId)` — emits `mark_read` event, returns Promise (lines 214-244); silently no-ops if disconnected
- `onNewMessage(cb)` / `onMessageRead(cb)` — store **a single** callback in `useRef` (overwrite-on-set, not a `Set`); the multi-subscriber fan-out is provided by `SocketProvider` (see §3c)

**Notifications socket — File:** `apps/web/src/hooks/useNotificationsSocket.ts`

- Second `io(API_BASE_URL, { path: '/socket.io', withCredentials: true })` connection
- Listens for `new_notification` (driven by `NotificationsGateway` on the backend, room `notifications:<userId>`)
- Reconnection enabled with default backoff (no explicit cap, unlike the messages socket)
- `onNewNotification(cb)` — single-callback slot via `useRef`, like the messages hook

**AI socket — File:** `apps/web/src/hooks/useAiSocket.ts` (separate, not part of `SocketProvider`)

- Third connection to the same backend, listening to `RESUME_PARSED_<userId>` and `RESUME_SCORED_<userId>`
- Mounted globally via `<GlobalAiSocket />` in `apps/web/src/app/providers.tsx`

### 3c. Socket Context Provider (web)

**File:** `apps/web/src/contexts/socket-provider.tsx`

- Mounted once at the root via `apps/web/src/app/providers.tsx:33`
- Internally calls **both** `useMessagesSocket()` and `useNotificationsSocket()`, so it owns two Socket.IO connections
- Maintains `Set<callback>`-based multi-subscriber pattern for `new_message`, `message_read`, `new_notification` (the underlying hooks only hold a single callback; the provider re-fans events out)
- `onNewMessage(cb)`, `onMessageRead(cb)`, `onNewNotification(cb)` return **unsubscribe functions** (lines 102-107)
- Exposes `socket`, `isConnected`, `activeChatId`, `setActiveChatId`, `sendMessage`, `markAsRead` to consumers via the `useSocket()` hook
- Silently catches per-subscriber errors (`console.error`) so one bad subscriber cannot break fan-out

**Auth model (web):** no explicit token is sent in the WS handshake. The browser's `better-auth.session_token` HTTP-only cookie is sent automatically via `withCredentials: true`. The backend gateways call `authService.validateToken(handshake.headers)` and `client.disconnect()` on failure.

### 3d. Mobile WebSocket Layer (NEW)

**File:** `apps/mobile/src/hooks/useMessagesSocket.ts`

The mobile client uses the same `socket.io-client` package as the web (`^4.8.3`, matching the server), but with two RN-specific options. **Both are mandatory.**

```ts
let _socket: Socket | null = null;

export function getOrCreateSocket(): Socket {
  if (_socket) return _socket;

  _socket = io(API_BASE_URL, {
    path: '/socket.io',

    // RN does not support HTTP long-polling; force the websocket transport.
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
```

The socket is a **module-level singleton**, not a `useRef`. This is the deliberate fix for the web's "useMessagesSocket returns a new object every render" problem. One module load → one socket.

Typed emit helpers (`emitSendMessage`, `emitMarkRead`) keep the rest of the codebase from importing `socket.io-client` directly or casting payloads.

### 3e. Mobile Socket Context Provider (NEW)

**File:** `apps/mobile/src/contexts/SocketProvider.tsx`

Mounted once at the app root via `apps/mobile/src/app/_layout.tsx` (inside `<QueryClientProvider>`, since `SocketProvider` calls `useQueryClient` internally).

The provider owns the subscription registry (fix for the web's "single-callback slot" smell) and the cache bus:

```
useMessagesSocket.getOrCreateSocket()  ── module-level singleton
                                              │
SocketProvider owns the registry              │
                                              ├─ raw socket events  (connect, disconnect, reconnect_*, error)
                                              ├─ subscription registry  (Set<callback> per event)
                                              └─ AppState listener: queryClient.invalidateQueries(['chat-summary'])
                                                  on AppState change → 'active' and socket.connected
```

Two pure cache updaters in `apps/mobile/src/contexts/cacheUpdaters.ts`:

- **`applyNewMessageToSummary(old, msg)`** — bumps `lastMessage` + `lastMessageAt`, sets `hasUnread = true` on the matching conversation, and bubbles it to the top of the list (senderId-match, stable sort).
- **`applyNewMessageToHistory(old, msg)`** — appends to `pages[0]`, with two de-dup guards:
  1. **Real messageId** de-dup (catches sender-self-echo from multi-device, reconnect storms, the rare optimistic-send-swap race)
  2. **localId de-dup** within a 5-second window: if there's a `local-*` entry with matching `senderId` + `content` + close timestamp, the local entry is removed and the real one is inserted

The provider's `onNewMessage` flow:

```
WS event 'new_message' (in SocketProvider, before any subscriber sees it)
  ├─ Set<NewMessageListener>.forEach (fan out to subscribers)
  │
  ├─ queryClient.setQueriesData(['chat-summary', *], applyNewMessageToSummary)
  │     - bumps lastMessage + lastMessageAt, sets hasUnread=true, bubbles to top
  │
  ├─ queryClient.setQueryData(['chat-history', msg.chatId], applyNewMessageToHistory)
  │     - de-dup by real messageId, then de-dup by localId + content + time window
  │
  └─ useUnreadDot reads ['chat-summary', userId] and recomputes its flag automatically
     (no manual state, no events, no fan-out — React Query is the bus)
```

```
WS event 'message_read'
  └─ Set<MessageReadListener>.forEach (fan out)
     - The SocketProvider doesn't know the current userId without a closure;
       subscribers (useUnreadDot) are responsible for invalidating
       ['chat-summary', userId] themselves.
```

**The key simplification: the React Query cache is the bus.** There is no manual `useState`, no `Set<callback>` fan-out for state (only for the WS event stream), no duplicated unread state. This is the single change that fixes the web's "two sources of truth for unread" smell.

### 3f. Connection lifecycle (mobile)

| Event                                      | Behavior                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `SocketProvider` mount                     | `getOrCreateSocket()` returns the singleton; `socket.connect()` runs once (idempotent)                               |
| `SocketProvider` unmount (e.g. hot reload) | Listeners cleaned up via `socket.off(...)`; **socket itself stays alive** so reconnect doesn't lose subscriptions    |
| Socket disconnect                          | `socket.io` auto-reconnects with backoff (1s, 2s, 4s, ..., cap 5s, 10 attempts)                                      |
| All 10 attempts fail                       | `connect_error` logged; socket is in a failed state (sends will time out)                                            |
| App backgrounded                           | Socket stays connected (matches web); ping/pong keeps the TCP socket warm                                            |
| App foregrounded                           | `AppState` listener invalidates `['chat-summary']`                                                                   |
| Logout                                     | Out of scope (the web doesn't handle it either — `client.disconnect()` only happens if `validateToken` returns null) |

---

## 4. Business Logic (Backend Service)

**File:** `apps/backend/src/app/messages/messages.service.ts`

`getChatId(userA, userB)` is a `static` helper (made public from `private static` in the mobile-compat refactor so the gateway can call it).

### `sendMessage(senderId, dto): Promise<{ messageId: string; timestamp: string }>` (lines 19-70)

1. Compute `chatId = [senderId, recipientId].sort().join(':')`
2. Generate `TimeUuid.now()` as message ID (encodes exact timestamp)
3. `INSERT INTO messages (chat_id, message_id, sender_id, content)` in ScyllaDB
4. Upsert **both** conversation rows simultaneously in PostgreSQL via `Promise.all`
5. **NEW:** return `{ messageId: messageId.toString(), timestamp: new Date().toISOString() }` — was `void`

### `getChatListSummary(userId)` (lines 78-116)

1. Fetch all `conversation` rows for this user from PostgreSQL, ordered by `lastMessageAt DESC`
2. For each conversation: query `last_seen` table for `last_read`, compare against latest message timestamp to determine `hasUnread`
3. Return enriched `ChatSummaryResponse[]` with participant details from User relation

### `getChatHistory(senderId, recipientId, limit)` (lines 232-274)

1. Compute `chatId` via same deterministic formula
2. Query `SELECT * FROM messages WHERE chat_id = ? LIMIT ?`
3. Enrich each message with sender `name`/`avatarUrl` from PostgreSQL User table
4. Extract timestamp via `TimeUuid.getDate()` — no separate timestamp column needed

> **Note:** the backend `getChatHistory` endpoint does **not** yet support cursor-based pagination. The mobile `useChatHistory` hook is built with `useInfiniteQuery` for forward compatibility, but today the server returns the most recent 50 messages on every call.

### `markAsRead(senderId, recipientId): Promise<string>` (lines 72-78)

`INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())` then returns `new Date().toISOString()` — was `void`.

### `createConversation(userId, participantId)` (lines 200-230)

Upsert conversation rows for both users in PostgreSQL (idempotent).

---

## 5. Frontend Pages & Components

### 5a. Pages (web)

| Route                 | File                                                | Purpose                                                                                                                       |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/employer/messages`  | `apps/web/src/features/employer/messages/page.tsx`  | Employer messaging UI (350 lines)                                                                                             |
| `/candidate/messages` | `apps/web/src/features/candidate/messages/page.tsx` | Candidate messaging UI (401 lines) — ~90% duplicate of employer; auto-selects conversation when `?recruiterId=` is in the URL |

> **Note (still open):** The employer page **does not** read the `?candidateId=` query param that `useMessageCandidate` sets in the URL. The candidate page handles its `?recruiterId=` correctly. Inconsistent.
>
> **Web sender-self-echo fix (NEW):** `apps/web/src/features/employer/messages/page.tsx` now has an early `return` in the `onNewMessage` callback for messages where `message.senderId === currentUser?.id`. This prevents the new sender-self-echo from duplicating the optimistic message the page just appended in its `handleSendMessage`. The web continues to function as before for all other events.

### 5b. In-page Chat Components (web)

| Component             | File                                                              | Purpose                                                                  |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ConversationSidebar` | `apps/web/src/features/employer/messages/ConversationSidebar.tsx` | Left panel: searchable list with unread dots, emits `mark_read` on click |
| `ChatWindow`          | `apps/web/src/features/employer/messages/ChatWindow.tsx`          | Right panel: message history, input, send                                |
| `MessageBubble`       | `apps/web/src/features/employer/messages/MessageBubble.tsx`       | Individual message with avatar, content, timestamp, date separators      |

The candidate page imports all of these from `@/features/employer/messages/...` (architectural smell — see §11).

### 5c. Global Navigation Sidebars (web)

These are **layout-level** components that show the blue "has unread messages" dot on the "Messages" item in the persistent left sidebar of the app shell.

| Component          | File                                                                      | Consumer of WS state                                    |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| `EmployerSidebar`  | `apps/web/src/components/employer/employerSidebar.tsx:84-89, 156-158`     | `useUnreadMessagesDot()` → `hasUnreadMessages: boolean` |
| `CandidateSidebar` | `apps/web/src/components/candidate/candidateSidebar.tsx:158-160, 110-113` | `useUnreadMessagesDot()` → `hasUnreadMessages: boolean` |

The hook that turns WS events into the sidebar dot lives at `apps/web/src/hooks/useMessages.ts:20-120` (`useUnreadMessagesDot`). Its flow:

1. On mount: `fetchChatSummary(userId)` (REST) → `setHasUnreadMessages(summaries.some(s => s.hasUnread))`.
2. On `onNewMessage`: if `activeChatId !== message.senderId`, flip the dot to `true` **immediately** and refetch `getChatSummary` to re-validate from the server.
3. On `onMessageRead`: refetch `getChatSummary` to recompute the boolean (e.g., when a peer reads one of your messages).

The dot clears when the user opens a conversation and the messages page optimistically sets `unread: false` on that chat + emits `mark_read`, which then reflows `getChatSummary` and `useUnreadMessagesDot` recomputes the flag.

The topbar notification **bell** with a numeric `99+` badge is a separate, independent flow: it consumes the **notifications** socket via `useNotifications()` (`apps/web/src/hooks/useNotifications.ts:80-86`) and renders in `candidateTopBar.tsx:88-92` / `employerTopBar.tsx:131-135`. It is **not** the same counter as the "Messages" sidebar dot.

### 5d. Page Flow (web — `page.tsx`)

1. **Mount** → `fetchChatSummary(userId)` via REST → transform `ChatSummary[]` to `Conversation[]` (auto-generated `timestamp` HH:mm string) → auto-select first conversation → optimistically clear its `unread` flag → emit `mark_read` over WS if it was unread.
2. **Select conversation** → `ConversationSidebar.handleSelectConversation` emits `mark_read` over WS (lines 34-50) AND calls `onSelectConversation` → page sets `selectedConversation` + `setActiveChatId(participantId)` in the socket context → `ChatWindow` fires `fetchChatHistory(participantId, 50)` via REST → messages are sorted ascending and decorated with date separators → `setMessages` → auto-scroll to bottom.
3. **Send message** → call `sendMessage(participantId, content)` via WebSocket → **optimistically** append a `Message` to local state with `messageId: 'temp-${Date.now()}'` → optimistically update the matching sidebar row's `lastMessage` + `timestamp`. The server echo (a `new_message` event) is now **filtered out at the top of `onNewMessage`** (early return for `senderId === currentUser.id`) — so the duplicate `'socket-${Date.now()}'` message no longer appears. The optimistic message is never reconciled to a real ID; it stays in the list under the temp id until the user navigates away.
4. **Receive WebSocket `new_message`** (`page.tsx:154-222`) → early-return if it's a self-sent message (NEW, fixes duplicate) → otherwise:
   - **This page's `onNewMessage` handler:** if `activeChatIdRef.current === message.senderId`, append the message to the active thread and emit `mark_read` (only when `document.visibilityState === 'visible'`). In all cases, update the matching conversation row's `lastMessage` + `timestamp` and set `unread = !isActiveChat` **optimistically** (the WS payload has no `hasUnread` field). Then re-sort the list by moving the matching conversation to index 0 (stable bubble, not a timestamp sort).
   - **`useUnreadMessagesDot`** (in the global sidebars): same fan-out, different update rules — flips the global dot to `true` and refetches `getChatSummary` for re-validation.
5. **Receive WebSocket `message_read`** → `useUnreadMessagesDot` refetches `getChatSummary`. The in-page list **does not** listen to `message_read` (it only updates the active conversation's row on `new_message`).

### 5e. Mobile Pages & Components (NEW)

| Route                         | File                                                       | Purpose                                                                             |
| ----------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `/employer/messages`          | `apps/mobile/src/app/pages/employer/messages/index.tsx`    | Conversation list with `FlatList`, search, pull-to-refresh, unread blue dot per row |
| `/employer/messages/[chatId]` | `apps/mobile/src/app/pages/employer/messages/[chatId].tsx` | Chat detail: header, `FlatList` of `MessageBubble`s (inverted), `MessageInput`      |

| Component                  | File                                                                                   | Purpose                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `EmployerDashboardSidebar` | `apps/mobile/src/app/pages/employer/dashboard/components/EmployerDashboardSidebar.tsx` | Sidebar with blue dot on "Messages" via `useUnreadDot()`                                         |
| `MessageListItem`          | `apps/mobile/src/app/pages/employer/messages/components/MessageListItem.tsx`           | Row with avatar, name, timestamp, preview, unread blue dot (testID `unread-dot`)                 |
| `MessagesSearchBar`        | `messages/components/MessagesSearchBar.tsx`                                            | Search input with icon (filters by name + lastMessage)                                           |
| `MessagesLoading`          | `messages/components/MessagesLoading.tsx`                                              | Centered `ActivityIndicator`                                                                     |
| `MessagesError`            | `messages/components/MessagesError.tsx`                                                | Inline error with "Try again" button                                                             |
| `ChatHeader`               | `messages/components/ChatHeader.tsx`                                                   | Back button, avatar, name, role, online dot                                                      |
| `MessageBubble`            | `messages/components/MessageBubble.tsx`                                                | Single message; different alignment/colors for sent vs received; renders date separators         |
| `MessageInput`             | `messages/components/MessageInput.tsx`                                                 | Multiline `TextInput` + Send button with spinner while pending (testID `send-button`)            |
| `ChatEmptyState`           | `messages/components/ChatEmptyState.tsx`                                               | "No messages yet — say hi 👋"                                                                    |
| `ChatLoading`              | `messages/components/ChatLoading.tsx`                                                  | Reused style for the chat detail initial load                                                    |
| `ChatError`                | `messages/components/ChatError.tsx`                                                    | "Unable to load conversation" + Try again / Back                                                 |
| `ApplicantsTab` (modified) | `apps/mobile/src/app/pages/employer/jobs/components/ApplicantsTab.tsx`                 | Per-row "Message" button (testID `message-candidate-button`) that triggers `useMessageCandidate` |

### 5f. Mobile Page Flow

**List screen — `apps/mobile/src/app/pages/employer/messages/index.tsx`:**

1. Mount → `useGetEmployerProfile()` resolves the userId → `useChatSummary(userId)` fires `GET /chats/summary?userId=`
2. React Query auto-refetches on `AppState→active` and on `refetchOnReconnect`
3. `ChatSummary[]` → `Conversation[]` (UI type) via `mapChatSummaryToConversation`
4. `FlatList` renders rows; `MessagesSearchBar` client-side filters by name + last message
5. `MessageListItem` shows the unread blue dot when `unread === true`
6. Tap → `router.push({ pathname: '/employer/messages/[chatId]', params: { chatId } })`

**Chat screen — `apps/mobile/src/app/pages/employer/messages/[chatId].tsx`:**

1. `useLocalSearchParams<{ chatId }>()` reads the chatId from the route
2. `useChatSummary(userId)` looks up the conversation metadata from the cache; `useEnsureSummaryLoaded` refetches the summary once if the chatId is missing (cold-cache deeplink)
3. `useChatHistory(chatId, participantId)` (infinite query, but server pagination is stubbed — returns the first 50 messages)
4. Pages flattened + sorted ASCENDING by timestamp, then decorated with `withDateSeparators` (date labels: Today / Yesterday / MMM D — no year). Sort is done client-side because the backend `getChatHistory` endpoint has no `ORDER BY`; the client-side sort masks the symptom but the server still returns rows in arbitrary order.
5. **`useMarkAsReadOnFocus`** (debounced 500ms) fires `mark_read` on mount + on `AppState→active` while the screen is open
6. **`useSendMessage`** mutation: optimistic insert with `local-{uuid}` → emit over WS → on ack, swap `localId` → real `messageId`; on ack error or 10-second timeout, roll back + show toast
7. WS `new_message` events handled by `SocketProvider` (NOT by this screen): the cache is updated with de-dup, and React Query re-renders this screen automatically. Sender-self-echo is dropped at the cache layer.

**Conversation initiation — Applicants tab:**

1. Tap "Message" on a candidate row → `useMessageCandidate({ employerId, candidateId })`
2. `useInitConversation` mutation: `POST /chats/init/:friendId` → server upserts both conversation rows → returns `chatId`
3. `onSuccess` invalidates `['chat-summary', userId]` and `router.push({ pathname: '/employer/messages/[chatId]', params: { chatId } })`

This is the mobile flow that **fixes the web's documented `?candidateId=` bug** by going straight to the chatId route — no URL query string.

---

## 6. Architecture Diagram

```
┌───────────────────────────────────────┐          ┌─────────────────────────────────────────┐
│  Web Frontend (Next.js)               │          │  Backend (NestJS)                       │
│                                       │          │                                         │
│  Providers (apps/web/src/app/         │          │  MessagesGateway    (room = userId)     │
│    providers.tsx)                     │          │  ├─ handleConnection                   │
│  └─ SocketProvider (Context)          │          │  │   (auth via handshake.headers.cookie │
│     ├─ useMessagesSocket() ───────────┼───WS #1──┤  │    OR handshake.auth.cookie  ← RN)   │
│     │  - send_message                 │          │  ├─ @SubscribeMessage('send_message')   │
│     │  - mark_read                    │          │  │   → ack { status, messageId, ts }     │
│     │  - new_message (incoming)       │          │  │   → emit 'new_message' to recipient    │
│     │  - message_read (incoming)      │          │  │   → emit 'new_message' to sender room  │
│     ├─ useNotificationsSocket() ──────┼───WS #2──┤  │     (multi-device sync)                │
│     │  - new_notification (incoming)  │          │  ├─ @SubscribeMessage('mark_read')      │
│     └─ pub/sub fan-out (Set<cb>)      │          │  │   → ack { status, lastReadAt }        │
│                                       │          │  └─ emit 'message_read' (both parties)  │
│  Page-level onNewMessage has          │          │                                         │
│  early-return for sender-self-echo    │          │  NotificationsGateway (room =           │
│  ─────────────────────────            │          │  notifications:<userId>)                │
│  REST Client (axios, w/ cookies)      │          │  AiGateway (room = userId)              │
│  ├─ GET  /api/chats/summary?userId=   ┼──HTTP────┼─▶ MessagesController                  │
│  ├─ GET  /api/chats/history/:friendId │          │  ├─ GET  /chats/summary                │
│  ├─ POST /api/chats/read/:friendId    │          │  ├─ GET  /chats/history/:friendId      │
│  └─ POST /api/chats/init/:friendId    │          │  ├─ POST /chats/read/:friendId         │
│                                       │          │  └─ POST /chats/init/:friendId         │
│  Global Sidebars (layout)             │          │                                         │
│  ├─ EmployerSidebar ─ useUnread…  ◄───┼──fan-out─┤  MessagesService                       │
│  └─ CandidateSidebar ─ useUnread… ◄───┼──fan-out─┤  ├─ sendMessage() → { messageId, ts }  │
│                                       │          │  ├─ getChatListSummary()               │
│  Topbar Bell (candidateTopBar.tsx,    │          │  ├─ getChatHistory()                   │
│    employerTopBar.tsx) ─ useNotifs()  │          │  ├─ markAsRead() → ISO string          │
│                                       │          │  └─ createConversation()               │
│  Pages / In-page Components           │          │                                         │
│  ├─ /employer/messages ─ onNewMessage─┼──fan-out─┤  ┌──────────────┐ ┌──────────────┐    │
│  ├─ /candidate/messages (duplicate)   │          │  │   ScyllaDB   │ │  PostgreSQL  │    │
│  ├─ ConversationSidebar              │          │  │  ├─ messages │ │  ├─ user     │    │
│  ├─ ChatWindow                        │          │  │  └─ last_seen│ │  └─ conv.    │    │
│  └─ MessageBubble                     │          │  └──────────────┘ └──────────────┘    │
└───────────────────────────────────────┘          │                                         │
┌───────────────────────────────────────┐          │  JoblyIoAdapter (Redis pub/sub         │
│  Mobile (Expo / React Native)         │          │   optional, in-memory fallback)        │
│                                       │          │                                         │
│  app/_layout.tsx                      │          │                                         │
│  └─ <SocketProvider>                  │          │                                         │
│     └─ <QueryClientProvider>          │          │                                         │
│        └─ <Stack>                     │          │                                         │
│           ├─ /employer/messages       │          │                                         │
│           │  useChatSummary (RQ)      │          │                                         │
│           │  MessageListItem (dot)    │          │                                         │
│           │  tap → router.push        │          │                                         │
│           └─ /employer/messages/[id]  │          │                                         │
│              useChatHistory (infinite)│          │                                         │
│              useSendMessage           │          │                                         │
│              useMarkAsReadOnFocus     │          │                                         │
│                                       │          │                                         │
│  contexts/SocketProvider.tsx          │          │                                         │
│  ├─ getOrCreateSocket() (singleton) ──┼───WS #1──┤  single connection                     │
│  │    transports: ['websocket']       │          │  auth.cookie (merged server-side)      │
│  │    reconnection: 10 attempts       │          │                                         │
│  ├─ Set<cb> fan-out                   │          │                                         │
│  ├─ cacheUpdaters (pure)              │          │                                         │
│  │    applyNewMessageToSummary        │          │                                         │
│  │    applyNewMessageToHistory (de-dup)│          │                                         │
│  └─ AppState listener → invalidate    │          │                                         │
│                                       │          │                                         │
│  hooks/messaging/                     │          │                                         │
│  ├─ useChatSummary (RQ ['chat-summary', userId]) │                                       │
│  ├─ useChatHistory  (RQ infinite)     │          │                                         │
│  ├─ useSendMessage  (mutation + 10s timeout)     │                                       │
│  ├─ useMarkAsRead   (WS mutation)     │          │                                         │
│  ├─ useMarkAsReadOnFocus (debounced)  │          │                                         │
│  ├─ useUnreadDot   (reads ['chat-summary', userId])                                       │
│  ├─ useInitConversation              │          │                                         │
│  └─ useMessageCandidate              │          │                                         │
│                                       │          │                                         │
│  EmployerDashboardSidebar ─ useUnread…◄┤          │                                         │
│                                       │          │                                         │
└───────────────────────────────────────┘          └─────────────────────────────────────────┘
                                                                                          │
                         NEXT_PUBLIC_API_URL / EXPO_PUBLIC_API_URL (WebSocket + HTTP) ◄──┘
```

### WebSocket fan-out — web

```
Backend MessagesGateway emits 'new_message'  →  useMessagesSocket.on('new_message')
                                                 └─ messageCallbackRef.current(msg)
                                                        │
                                                        ▼
                                             SocketProvider fan-out
                                             (Set<callback>.forEach)
                                                 ┌──────────┼──────────┐
                                                 ▼          ▼          ▼
                                 useUnreadMessagesDot   messages/page  (any other
                                   (global sidebar      .tsx onNewMessage subscriber)
                                    dot + refetch)     (in-page list + thread)
                                                  │
                                                  ▼
                            page.tsx onNewMessage: early-return if
                            message.senderId === currentUser.id  (self-echo)
```

### WebSocket fan-out — mobile (the React Query bus)

```
Backend MessagesGateway emits 'new_message'  →  SocketProvider's raw socket listener
                                                 ├─ Set<NewMessageListener>.forEach (fan out)
                                                 │
                                                 ├─ queryClient.setQueriesData(['chat-summary', *],
                                                 │     applyNewMessageToSummary)
                                                 │     - bumps lastMessage, sets hasUnread=true, bubbles to top
                                                 │
                                                 ├─ queryClient.setQueryData(['chat-history', msg.chatId],
                                                 │     applyNewMessageToHistory)
                                                 │     - de-dup by real messageId (catches sender-self-echo)
                                                 │     - de-dup against localId entries by content+sender+time
                                                 │
                                                 └─ useUnreadDot reads ['chat-summary', userId] and
                                                    recomputes its flag automatically

The chat screen [chatId].tsx doesn't subscribe to onNewMessage at all — React Query
re-renders it when the chat-history cache changes.
```

---

## 7. Conversation Initiation Flow

### 7a. Web (legacy)

**Files:** `apps/web/src/hooks/useMessageCandidate.ts`, `apps/web/src/api-hook/messages/useInitializeConversation.ts`

1. User clicks "Message" on a candidate/employer profile
2. `useInitializeConversation.initChat(userId, targetId)`:
   - Checks existing conversations via `getChatSummary()` (REST)
   - If none found, calls `POST /api/chats/init/:friendId` (REST) → upserts both conversation rows
   - Refetches conversations to get the new `chatId`
3. Navigates to `/employer/messages?candidateId=...` or `/candidate/messages?recruiterId=...`
4. **Bug:** the employer page ignores `?candidateId=` — only the candidate page's `?recruiterId=` is read

### 7b. Mobile (NEW)

**Files:** `apps/mobile/src/hooks/messaging/useInitConversation.ts`, `apps/mobile/src/hooks/messaging/useMessageCandidate.ts`

1. User taps the "Message" button on an `ApplicantsTab` candidate row
2. `useMessageCandidate({ employerId, candidateId })` → `useInitConversation({ userId, friendId })`
3. `useInitConversation` mutation: `POST /chats/init/:friendId` → server upserts both rows idempotently → returns `{ chatId }`
4. `onSuccess` invalidates `['chat-summary', userId]` and `router.push({ pathname: '/employer/messages/[chatId]', params: { chatId } })`
5. Chat screen resolves conversation metadata from the (just-invalidated) `chat-summary` cache via `useChatSummary`; `useEnsureSummaryLoaded` refetches once if the chatId isn't in the cache yet

This is the deliberate fix for the web's `?candidateId=` bug: the mobile flow pushes directly to the chatId route — no URL query string to be missed.

---

## 8. Unread Tracking

### 8a. Backend (ScyllaDB `last_seen` table)

- `INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())` sets current timestamp
- `getChatDetailsByChatId` (lines 119-198) compares latest message `TimeUuid` timestamp vs `last_read`:
  - No `last_read` row + message from other user → unread
  - `message_timestamp > last_read_timestamp` → unread
  - Latest message sent by current user → not unread
- The unread flag is a **per-conversation boolean** — there is no numeric counter anywhere in the system. `ChatSummary.hasUnread: boolean` is the only field on the wire.
- The topbar **bell** `unreadCount` (driven by `useNotifications`) is a **separate, numeric** counter for `Notification` rows, not for messages. The two do not interact.

### 8b. Web — two consumer paths for the same `new_message` event

Both subscribe to the same `onNewMessage` hub in `SocketProvider` but update the UI with **different rules**. This is the most subtle part of the architecture.

**1. In-page conversation list — `apps/web/src/features/employer/messages/page.tsx:154-222`**

- `unread` flag on the matching conversation is set **optimistically** to `!isActiveChat` (i.e. "unread unless the user is currently looking at this chat"). The WS payload has no `hasUnread` field.
- The matching conversation is **bubbled to the top** of the list with a stable sort (not a timestamp sort; other rows keep their existing order).
- The active thread receives the new message in its `messages` array, and `mark_read` is emitted (if the page is visible).
- **No refetch** is performed — the optimistic state stays until the next summary fetch.
- Does **not** listen to `message_read`, so the list will not auto-correct if its optimistic `unread: false` flip was wrong.
- **NEW (sender-self-echo fix):** early-returns at the top of the callback if `message.senderId === currentUser.id`.

**2. Global navigation sidebars — `apps/web/src/hooks/useMessages.ts:20-120` (`useUnreadMessagesDot`)**

- Subscribes via `useSocket().onNewMessage`.
- If `activeChatId !== message.senderId`, flips the global `hasUnreadMessages` flag to `true` **immediately** (the blue dot on the sidebar's "Messages" item).
- **Then refetches** `GET /api/chats/summary` to recompute the flag from the server's authoritative `hasUnread`. This is the only place that does the refetch.
- Also refetches on `message_read` events (e.g., when a peer reads one of your messages, no flag change, but re-validation).
- The flag clears when the user opens a conversation: the page optimistically sets `unread: false` on that chat, emits `mark_read`, and the next `fetchChatSummary` will reflect it, which then flows into `computeUnreadStatus` (`useMessages.ts:32-39`).

### 8c. Why the web paths are not symmetric

The list and the sidebar dot answer slightly different questions:

- **List** = "is _this_ conversation unread, and where should it sit in the list?"
- **Sidebar dot** = "is _any_ conversation unread right now?"

The list can be briefly wrong (e.g., the optimistic `unread: !isActiveChat` may disagree with the server's timestamp-based truth). The sidebar dot is self-correcting because it always re-derives from the server via `fetchChatSummary` after each `new_message`. There is no background polling.

### 8d. Mobile — single React Query bus (NEW)

The mobile client **collapses both web concerns into one source of truth**: the `['chat-summary', userId]` React Query cache. There is no separate "list unread" state and no separate "sidebar dot" state.

- **WS `new_message` event** → `SocketProvider` runs `applyNewMessageToSummary` → cache is updated → every consumer of `['chat-summary', userId]` (the list page, the sidebar's `useUnreadDot`, the chat screen's metadata lookup) re-renders with the new value.
- The list and the sidebar see the **same `hasUnread` value** (always). No asymmetry.
- The cache is **also updated** for incoming messages from other users; the list page's row gets `hasUnread: true` optimistically. (Self-correcting on the next `fetchChatSummary` refetch — which is triggered by `AppState→active` or by the peer marking a message as read.)
- `useUnreadDot` (`apps/mobile/src/hooks/messaging/useUnreadDot.ts`) is three lines: it reads `['chat-summary', userId]` and returns `(summaries ?? []).some(s => s.hasUnread)`. No events, no manual state.

This is the single change that **fixes the web's "two sources of truth for unread" smell** for the mobile client.

---

## 9. Key Files Reference

### Backend (`apps/backend/src/`)

| File                                         | Lines | Role                                                                                                                                                       |
| -------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/messages/messages.module.ts`            | 1-12  | Module: registers controller, gateway, service                                                                                                             |
| `app/messages/messages.controller.ts`        | 1-67  | REST endpoints for chat CRUD                                                                                                                               |
| `app/messages/messages.gateway.ts`           | 1-104 | Socket.IO gateway: real-time messaging, RN cookie-merge, typed acks, sender-self-echo                                                                      |
| `app/messages/messages.service.ts`           | 1-274 | Core business logic; `getChatId` is now `static` (was `private static`); `sendMessage` returns `{ messageId, timestamp }`; `markAsRead` returns ISO string |
| `app/messages/messages.interface.ts`         | 1-28  | TypeScript interfaces                                                                                                                                      |
| `app/messages/dto/sendMessageDTO.ts`         | 1-11  | Validation DTO (`recipientId` + `text`)                                                                                                                    |
| `app/notifications/notifications.gateway.ts` | 1-52  | `new_notification` gateway (room `notifications:<userId>`) — **not yet updated with RN cookie-merge** (out of scope)                                       |
| `app/ai/ai.gateway.ts`                       | 1-50  | AI event gateway (`RESUME_PARSED_<u>` / `RESUME_SCORED_<u>`) — **not yet updated with RN cookie-merge** (out of scope)                                     |
| `app/common/adapter/jobly-io.adapter.ts`     | 1-66  | Custom IoAdapter with optional Redis pub/sub                                                                                                               |
| `app/common/filter/ws-exceptions.filter.ts`  | 1-26  | WebSocket exception filter                                                                                                                                 |
| `app/auth/auth.service.ts`                   | 36-45 | `validateToken()` used by all three gateways                                                                                                               |
| `lib/db.ts`                                  | 1-24  | DB connection singletons (ScyllaDB, Prisma, Redis)                                                                                                         |
| `prisma/schema.prisma`                       | 51-66 | Conversation model definition                                                                                                                              |
| `main.ts`                                    | 56-58 | Wires the `JoblyIoAdapter` into NestJS                                                                                                                     |

### Frontend — web pages, components, layout (`apps/web/src/`)

| File                                                 | Lines                      | Role                                                                                                                           |
| ---------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `app/providers.tsx`                                  | 23-55                      | Root provider tree; mounts `SocketProvider` + `<GlobalAiSocket />`                                                             |
| `app/employer/messages/page.tsx`                     | –                          | Thin re-export of `features/employer/messages/page.tsx`                                                                        |
| `app/candidate/messages/page.tsx`                    | –                          | Thin re-export of `features/candidate/messages/page.tsx`                                                                       |
| `app/employer/layout.tsx`                            | 79                         | Mounts `<EmployerSidebar />`                                                                                                   |
| `app/candidate/layout.tsx`                           | 26                         | Mounts `<CandidateSidebar />`                                                                                                  |
| `features/employer/messages/page.tsx`                | 1-356                      | Employer messaging page (owns `conversations` state, WS `new_message` handler) — **has new early-return for sender-self-echo** |
| `features/candidate/messages/page.tsx`               | 1-401                      | Candidate messaging page (near-duplicate; reads `?recruiterId=`)                                                               |
| `features/employer/messages/ChatWindow.tsx`          | 1-235                      | Right panel: message history, input, send                                                                                      |
| `features/employer/messages/ConversationSidebar.tsx` | 1-126                      | Left panel: searchable list, emits `mark_read` on click                                                                        |
| `features/employer/messages/MessageBubble.tsx`       | 1-60                       | Individual message renderer                                                                                                    |
| `features/employer/messages/types.ts`                | 1-25                       | UI `Conversation` / `Message` types                                                                                            |
| `features/employer/messages/utils.ts`                | 1-64                       | Date, avatar, display helpers                                                                                                  |
| `components/employer/employerSidebar.tsx`            | 84-89, 156-158, 209-211    | Global nav sidebar (consumes `useUnreadMessagesDot`)                                                                           |
| `components/candidate/candidateSidebar.tsx`          | 110-113, 158-160, 206, 222 | Global nav sidebar (consumes `useUnreadMessagesDot`)                                                                           |
| `components/employer/employerTopBar.tsx`             | 27-39, 131-135             | Topbar with notification bell (consumes `useNotifications`)                                                                    |
| `components/candidate/candidateTopBar.tsx`           | 16-30, 88-92               | Topbar with notification bell (consumes `useNotifications`)                                                                    |

### Frontend — web WebSocket + state layer (`apps/web/src/`)

| File                                             | Lines | Role                                                                                         |
| ------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------- |
| `contexts/socket-provider.tsx`                   | 1-137 | Owns **two** Socket.IO clients; `Set<callback>` pub/sub fan-out; exposes `useSocket()`       |
| `hooks/useMessagesSocket.ts`                     | 1-254 | Messages socket (`send_message`, `mark_read`, `new_message`, `message_read`)                 |
| `hooks/useNotificationsSocket.ts`                | 1-89  | Notifications socket (`new_notification`)                                                    |
| `hooks/useAiSocket.ts`                           | 1-96  | AI socket (`RESUME_PARSED_<u>`, `RESUME_SCORED_<u>`)                                         |
| `hooks/useMessages.ts`                           | 1-120 | `useUnreadMessagesDot()` — turns WS into global sidebar dot                                  |
| `hooks/useNotifications.ts`                      | 1-120 | Topbar bell state from `useNotificationsSocket`                                              |
| `hooks/useMessageCandidate.ts`                   | 1-50  | Employer → candidate conversation initiator (navigates with `?candidateId=`)                 |
| `hooks/useUser.ts`                               | 1-30  | `User` type + session hook (better-auth)                                                     |
| `api-client/messages/types.ts`                   | 1-36  | API response types (`ChatSummary`, `ChatMessage`, `SocketChatMessage`, `SendMessageRequest`) |
| `api-client/messages/public.ts`                  | 1-73  | Axios REST client (`getChatSummary`, `getChatHistory`, `markChatRead`, `initConversation`)   |
| `api-hook/messages/useGetChatSummary.ts`         | 1-43  | `useGetChatSummary` — wraps REST in `useState`                                               |
| `api-hook/messages/useChatHistory.ts`            | 1-43  | `useChatHistory` — wraps REST in `useState`                                                  |
| `api-hook/messages/useInitializeConversation.ts` | 1-68  | **Used** by dashboard/applications pages                                                     |
| `api-hook/messages/useInitConversation.ts`       | –     | **Unused** (legacy)                                                                          |
| `api-hook/messages/useMarkChatRead.ts`           | –     | **Unused** (UI uses WS `mark_read` only)                                                     |
| `api-hook/messages/index.ts`                     | –     | Barrel export                                                                                |

### Frontend — mobile pages, components, layout (`apps/mobile/src/`)

| File                                                                   | Role                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/_layout.tsx`                                                      | Root layout; mounts `<SocketProvider>` inside `<QueryClientProvider>` (uses the shared `queryClient` from `lib/query-client.ts`); `<Toast />` mounted at top offset 60                                                                                                                                                                                                                           |
| `app/pages/employer/messages/index.tsx`                                | Conversation list screen; uses `useChatSummary`; tap → `router.push` to chat detail                                                                                                                                                                                                                                                                                                              |
| `app/pages/employer/messages/[chatId].tsx`                             | **NEW** chat detail screen with header, `FlatList` of `MessageBubble`s (data sorted ASCENDING — oldest at top), `useEffect`-based auto-scroll-to-bottom on `[messages.length]`, `MessageInput`; wires `useChatSummary`, `useChatHistory`, `useSendMessage`, `useMarkAsReadOnFocus`, `useEnsureSummaryLoaded`, `useSocket`; passes `userId` into `withDateSeparators` so `isSent` is pre-computed |
| `app/pages/employer/messages/components/MessagesSearchBar.tsx`         | Search input                                                                                                                                                                                                                                                                                                                                                                                     |
| `app/pages/employer/messages/components/MessageListItem.tsx`           | Conversation row; **NEW** `isUnread` prop, blue dot (testID `unread-dot`)                                                                                                                                                                                                                                                                                                                        |
| `app/pages/employer/messages/components/MessagesLoading.tsx`           | Centered spinner                                                                                                                                                                                                                                                                                                                                                                                 |
| `app/pages/employer/messages/components/MessagesError.tsx`             | Error with retry                                                                                                                                                                                                                                                                                                                                                                                 |
| `app/pages/employer/messages/utils.ts`                                 | `mapChatSummaryToConversation`, `formatTimestamp`, `filterBySearch`, **NEW** `withDateSeparators`, `mapChatHistoryToMessage`, `Message` UI type                                                                                                                                                                                                                                                  |
| `app/pages/employer/messages/types.ts`                                 | UI `Conversation` type                                                                                                                                                                                                                                                                                                                                                                           |
| `app/pages/employer/messages/components/ChatHeader.tsx`                | **NEW** Back button, avatar, name, role, online dot                                                                                                                                                                                                                                                                                                                                              |
| `app/pages/employer/messages/components/MessageBubble.tsx`             | **NEW** single message bubble (testID `bubble-sent` / `bubble-received`)                                                                                                                                                                                                                                                                                                                         |
| `app/pages/employer/messages/components/MessageInput.tsx`              | **NEW** multiline input + send button (testID `send-button`)                                                                                                                                                                                                                                                                                                                                     |
| `app/pages/employer/messages/components/ChatEmptyState.tsx`            | **NEW** "No messages yet"                                                                                                                                                                                                                                                                                                                                                                        |
| `app/pages/employer/messages/components/ChatLoading.tsx`               | **NEW** spinner for chat detail                                                                                                                                                                                                                                                                                                                                                                  |
| `app/pages/employer/messages/components/ChatError.tsx`                 | **NEW** chat error with Try again / Back                                                                                                                                                                                                                                                                                                                                                         |
| `app/pages/employer/dashboard/index.tsx`                               | **MODIFIED** — migrated from `useGetChatSummary` to `useChatSummary` (React Query)                                                                                                                                                                                                                                                                                                               |
| `app/pages/employer/dashboard/components/EmployerDashboardSidebar.tsx` | **MODIFIED** — wires `useUnreadDot`; renders small blue dot (testID `sidebar-unread-dot`) on the Messages nav item; replaced hardcoded `badge: 1`                                                                                                                                                                                                                                                |
| `app/pages/employer/jobs/components/ApplicantsTab.tsx`                 | **MODIFIED** — per-row "Message" button (testID `message-candidate-button`) that calls `useMessageCandidate`                                                                                                                                                                                                                                                                                     |

### Frontend — mobile WebSocket + state layer (`apps/mobile/src/`)

| File                                        | Role                                                                                                                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/query-client.ts`                       | **NEW** shared `QueryClient` with mobile-aware defaults: `staleTime: 30s`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`, mutations `retry: 0`              |
| `lib/utils.ts`                              | **MODIFIED** — added `uuid()` helper (RFC4122 v4 via `crypto.getRandomValues`)                                                                                                                      |
| `hooks/useMessagesSocket.ts`                | **NEW** module-level singleton socket; RN config (`transports: ['websocket']`, `auth.cookie`); typed `emitSendMessage` / `emitMarkRead` helpers; `_resetSocketForTests`                             |
| `contexts/SocketProvider.tsx`               | **NEW** `useSocket()` / `useSocket` context; `Set<cb>` registry; `AppState` listener invalidates `['chat-summary']` on `active`; handles both `new_message` and `message_read`                      |
| `contexts/cacheUpdaters.ts`                 | **NEW** pure functions `applyNewMessageToSummary` and `applyNewMessageToHistory` (de-dup by real `messageId` + 5s `localId` window)                                                                 |
| `hooks/messaging/useChatSummary.ts`         | **NEW** React Query wrapper: `useQuery({ queryKey: ['chat-summary', userId], enabled: !!userId, staleTime: 30_000 })`                                                                               |
| `hooks/messaging/useChatHistory.ts`         | **NEW** React Query `useInfiniteQuery` (cursor pagination stubbed — server returns the first 50)                                                                                                    |
| `hooks/messaging/useSendMessage.ts`         | **NEW** React Query `useMutation` with optimistic insert (`local-{uuid}`), 10-second timeout, ack swap, rollback + toast on error                                                                   |
| `hooks/messaging/useMarkAsRead.ts`          | **NEW** React Query `useMutation` wrapping `emitMarkRead`; optimistically clears `hasUnread` in the `chat-summary` cache on success                                                                 |
| `hooks/messaging/useMarkAsReadOnFocus.ts`   | **NEW** debounced (500ms) mark-read on mount + on `AppState→active`                                                                                                                                 |
| `hooks/messaging/useUnreadDot.ts`           | **NEW** `(summaries ?? []).some(s => s.hasUnread)` from `useChatSummary`                                                                                                                            |
| `hooks/messaging/useEnsureSummaryLoaded.ts` | **NEW** refetches `['chat-summary', userId]` once if the chatId isn't in the cache (cold-cache deeplink)                                                                                            |
| `hooks/messaging/useInitConversation.ts`    | **NEW** React Query `useMutation` for `POST /chats/init/:friendId`; on success invalidates `chat-summary` and `router.push` to chat detail                                                          |
| `hooks/messaging/useMessageCandidate.ts`    | **NEW** thin wrapper over `useInitConversation` with `{ employerId, candidateId }`                                                                                                                  |
| `hooks/useGetChatSummary.ts`                | **DELETED** (replaced by `hooks/messaging/useChatSummary.ts`; the dashboard now uses `useChatSummary` too)                                                                                          |
| `api/messages.ts`                           | **MODIFIED** — extended with `getChatHistory` and `initConversation`                                                                                                                                |
| `types/message.ts`                          | **MODIFIED** — full shared types (REST `ChatSummary` / `ChatMessage` / `ChatHistoryResponse` + WS `NewMessageEvent` / `MessageReadEvent` / `SendMessageRequest` / `SendMessageAck` / `MarkReadAck`) |

---

## 10. Mobile Frontend (React Native / Expo)

The mobile app (Expo + React Native) shares the same backend REST + WebSocket API as the web. The employer messaging flow is now wired end-to-end: list, chat detail, real-time messaging, mark-as-read, unread badge, and conversation initiation. The candidate messages page is not yet wired (out of scope for this iteration).

### Architecture (mobile)

```
┌─────────────────────────────────────────────────────────────────────┐
│  apps/mobile (Expo Router)                                          │
│                                                                      │
│  src/app/_layout.tsx                                                 │
│  └─ <QueryClientProvider> (shared queryClient from lib/query-client) │
│     └─ <SocketProvider>     (1 persistent socket, AppState-aware)   │
│        └─ <ThemeProvider>                                               │
│           └─ <SessionResumeGate>                                        │
│              └─ <Stack>                                                  │
│                 ├─ pages/employer/messages/index.tsx       (list)     │
│                 │  ↳ queryKey: ['chat-summary', userId]              │
│                 │  ↳ SocketProvider updates cache on new_message      │
│                 │  ↳ tap → router.push('/employer/messages/[chatId]')│
│                 │                                                        │
│                 └─ pages/employer/messages/[chatId].tsx   (chat)      │
│                    ↳ queryKey: ['chat-history', chatId] (infinite)   │
│                    ↳ useChatSummary for conversation metadata         │
│                    ↳ useEnsureSummaryLoaded (cold-cache refetch)      │
│                    ↳ useMarkAsReadOnFocus (debounced 500ms)           │
│                    ↳ useSendMessage (optimistic + 10s timeout)        │
│                                                                      │
│  src/contexts/SocketProvider.tsx     (1 socket, Set<cb> fanout)      │
│  src/contexts/cacheUpdaters.ts       (pure summary + history updates)│
│  src/hooks/useMessagesSocket.ts      (raw socket.io-client singleton)│
│  src/hooks/messaging/useChatSummary.ts                                │
│  src/hooks/messaging/useChatHistory.ts                                │
│  src/hooks/messaging/useSendMessage.ts                                │
│  src/hooks/messaging/useMarkAsRead.ts                                 │
│  src/hooks/messaging/useMarkAsReadOnFocus.ts                          │
│  src/hooks/messaging/useInitConversation.ts                            │
│  src/hooks/messaging/useMessageCandidate.ts                            │
│  src/hooks/messaging/useUnreadDot.ts                                   │
│  src/hooks/messaging/useEnsureSummaryLoaded.ts                         │
│  src/lib/query-client.ts             (shared QueryClient)            │
│  src/lib/utils.ts                    (uuid() helper)                  │
│                                                                      │
│  src/api/messages.ts                 (REST: summary / history / init)│
│  src/types/message.ts                (shared REST + WS types)        │
│  src/app/pages/employer/messages/types.ts (UI Conversation)         │
│  src/app/pages/employer/messages/utils.ts (mappers + separators)    │
└─────────────────────────────────────────────────────────────────────┘
```

### RN-specific WebSocket configuration

```ts
// apps/mobile/src/hooks/useMessagesSocket.ts
io(API_BASE_URL, {
  path: '/socket.io',
  transports: ['websocket'], // RN can't do HTTP long-polling
  auth: { cookie: authClient.getCookie() ?? '' }, // RN's socket.io-client doesn't
  // auto-attach cookies on the WS upgrade
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
});
```

Both options are **mandatory**. The server still handles the cookie merge on its side (`handleConnection` reads `handshake.auth.cookie` if `handshake.headers.cookie` is absent).

### Data flow

1. **App boot** → `SocketProvider` mounts → `getOrCreateSocket()` returns the singleton (or creates it)
2. **List screen mount** → `useGetEmployerProfile()` (TanStack Query) fires `GET /api/employer/me` → returns the employer profile with `id`
3. `useChatSummary(profile.id)` fires `GET /api/chats/summary?userId=` → returns `ChatSummary[]` → `mapChatSummaryToConversation` → UI `Conversation[]`
4. `FlatList` renders rows; each row shows the unread blue dot when `Conversation.unread === true`
5. **Tap a row** → `router.push({ pathname: '/employer/messages/[chatId]', params: { chatId } })`
6. **Chat screen** → `useChatSummary(userId).data.find(c => c.chatId === chatId)` looks up metadata; `useEnsureSummaryLoaded` refetches once if missing; `useChatHistory(chatId, participantId)` loads the first 50 messages; `withDateSeparators` decorates them with date labels
7. **On mount, `useMarkAsReadOnFocus`** fires `mark_read` (debounced 500ms) → server updates `last_seen` → sidebar dot clears on next summary refetch
8. **Type + Send** → `useSendMessage` does an optimistic insert (`local-{uuid}`), emits `send_message` over WS, waits for the ack (10s timeout)
9. **Ack arrives** → swap `localId` → real `messageId` in the cache; the WS `new_message` echo (now also emitted to the sender's room for multi-device sync) hits the de-dup guard in the cache updater and is a no-op
10. **WS `new_message` for a different chat** → `SocketProvider` runs `applyNewMessageToSummary` → bumps `lastMessage` + `lastMessageAt`, sets `hasUnread = true`, bubbles to top → `useUnreadDot` recomputes → sidebar dot appears
11. **Background → foreground** → `AppState` listener in `SocketProvider` invalidates `['chat-summary']` → React Query refetches → missed messages appear in the list

### Loading & Error States

| State                     | Behavior                                                     |
| ------------------------- | ------------------------------------------------------------ |
| List initial load         | Full-screen `MessagesLoading` spinner replaces the list      |
| List data loaded          | `FlatList` renders conversations with `RefreshControl`       |
| List pull-to-refresh      | `RefreshControl` spinner at top, existing data stays visible |
| List initial load failure | `MessagesError` component with retry button                  |
| List refresh failure      | Silently swallowed — previous data stays visible             |
| Chat initial load         | `ChatLoading` spinner inside the chat frame                  |
| Chat initial load failure | `ChatError` with Try again + Back buttons                    |

### Why `useGetEmployerProfile` instead of `useUser` (unchanged from before)

The mobile `useUser()` hook calls `authClient.useSession()` from Better Auth. This hook reads from an in-memory cache that is only populated by `authClient.getSession()`. The `SessionResumeGate` in `app/_layout.tsx` calls `getSession()` only on public routes (login, register, forgot-password) and skips it on protected routes. As a result, `useSession()` returns `{ data: null }` on protected pages, and `user.id` is never available.

`useGetEmployerProfile` is a TanStack Query backed by a real HTTP call. The axios interceptor sends the `Cookie` header on every request, so the backend validates the session and returns the user's profile regardless of whether Better Auth's in-memory cache is hydrated.

### What was NOT implemented (deferred)

- **Push notifications** when the app is backgrounded — requires `expo-notifications` + APNs/FCM credentials
- **Offline message queue** — failed sends surface a "tap to retry" toast; the message is lost on retry-cancel
- **Typing indicators** — backend has no `typing` event
- **Read receipts in chat UI** ("Seen 2m ago") — backend emits `message_read` to the sender, but no UI renders it
- **Attachments / images / voice** — web has none, mobile gets the same
- **Server-side message search** — web has client-side filter only
- **Candidate messages page** (mobile) — out of scope for this iteration
- **Notifications socket on mobile** — mobile has no topbar bell yet; the architecture (one shared socket) is ready for it
- **WS reconnection backfill for missed messages** — we invalidate `['chat-summary']` on `AppState→active`, which is a partial fix; a full "since-disconnect cursor" fetch would require backend support
- **Multi-device session management** — sender-self-echo de-dup is built in; no "this conversation is open on N devices" UI
- **Group chat / multiple participants** — backend model is 1:1 (`Conversation` keyed on a single `participantId`)
- **Message editing / deletion** — backend has no endpoints

---

## 11. Known Issues, Gaps & Smells

Documented for future work — not blockers, but worth tracking.

### Web (apps/web)

- **Two near-duplicate message pages.** `features/candidate/messages/page.tsx` (401 lines) and `features/employer/messages/page.tsx` (350 lines) are ~90% identical. The candidate page imports `ConversationSidebar`, `ChatWindow`, `types`, and `utils` from `features/employer/messages/…` — feature code living under `employer/` but consumed by `candidate/`. A single shared `features/messages/` module would replace both.
- **Employer page ignores `?candidateId=`.** `useMessageCandidate` navigates to `/employer/messages?candidateId=…`, but `features/employer/messages/page.tsx` never reads `searchParams`. The candidate page does read `?recruiterId=` correctly. Inconsistent.
- **Two parallel "init conversation" hooks.** `useInitConversation.ts` is dead code; `useInitializeConversation.ts` is the one used. Delete one.
- **Dead `useMarkChatRead`.** The REST `POST /chats/read/:friendId` endpoint is wired in the backend and the api-hook layer, but the UI never calls it. Mark-as-read only happens via the `mark_read` WS event. No offline fallback if the socket is disconnected.
- **Optimistic sent messages are not reconciled.** Sent messages get `messageId: 'temp-${Date.now()}'`. With the new sender-self-echo early-return in `onNewMessage`, the duplicate `'socket-${Date.now()}'` message no longer appears — but the temp id stays in the list. The message looks correct, but the id is a lie. (Mobile: this is solved end-to-end with `local-{uuid}` → real `messageId` swap.)
- **Two sources of truth for "any unread?"** The in-page list and `useUnreadMessagesDot` both maintain their own `unread` state. They can briefly disagree (see §8c). (Mobile: this is solved via the React Query cache bus.)
- **Duplicate `mark_read` emissions on click.** `ConversationSidebar.handleSelectConversation` emits `mark_read`, and the page also auto-emits on initial-load auto-select and on receiving messages in the active chat. Idempotent on the server (`INSERT … now()`) but wasteful, and the page would silently stop syncing if the sidebar's emit were ever removed (the two are coupled by convention, not contract).
- **No React Query for messages.** Project already uses `@tanstack/react-query` for `useUser`; messages use raw `useState` + `axios` with no caching, dedup, retries, or background refetch. `fetchChatSummary` is called from at least three places (`useGetChatSummary`, `useUnreadMessagesDot`, dashboard pages). (Mobile: solved.)
- **Debug logging on in production.** `useMessagesSocket.ts:10` and `useNotificationsSocket.ts:9` hard-code `const DEBUG = true;`. Console output ships.
- **Two Socket.IO connections, one provider.** `useMessagesSocket` and `useNotificationsSocket` each open their own connection. They could be unified into a single `io()` that listens to both event namespaces. No functional reason to keep them separate.
- **Single-callback slot in the underlying hooks.** `useMessagesSocket.onNewMessage` uses `messageCallbackRef.current = callback` (overwrite), not a `Set`. The multi-subscriber fan-out only exists in `SocketProvider`. Anyone bypassing the context would silently lose subscribers.
- **`SocketProvider` re-registers its internal fan-out on every render of its parent** because `useMessagesSocket` returns a new object each render, so `[socketReturn]` is a fresh identity every frame. (Mobile: solved with the module-level singleton.)
- **No reconnection backfill.** If the socket disconnects and reconnects, no `fetchChatSummary` is fired — only `useUnreadMessagesDot` does it, and only on `new_message` / `message_read` events. Missed messages are not reconciled. (Mobile: partial fix via `AppState→active` invalidation.)
- **Notification hook has no reconnection cap.** `useNotificationsSocket` only sets `reconnection: true`; it will hammer the server with default backoff forever. `useMessagesSocket` caps at 10 attempts.
- **No session refresh on reconnect.** If the `better-auth.session_token` cookie expires while the tab is backgrounded, the WS fails to re-auth silently. (Mobile partially addressed: backend now also reads `handshake.auth.cookie` — the React Native client sends the cookie from SecureStore on every reconnect.)

### Backend (apps/backend)

- **Latent `LIMIT 1` ordering bug in `messages.service.ts:146-150`.** The `SELECT message_id, sender_id FROM messages WHERE chat_id = ? LIMIT 1` query has no `ORDER BY`. ScyllaDB's clustering order is **ascending** on `message_id` (TimeUuid), so the first row returned is the **oldest** in the partition, not the latest. The subsequent comparison to `last_read` (`hasUnread = messageTimestamp > lastReadTimestamp`, line 173) can therefore evaluate against a stale message. Fix: add `ORDER BY message_id DESC LIMIT 1` (or use a different query shape that picks the latest).
- **Inconsistent room naming.** `messages.gateway.ts:42` and `ai.gateway.ts:31` use `userId` directly as the room name; `notifications.gateway.ts:31` uses `notifications:${userId}`. Works today but blocks any future "broadcast to a user's every device" feature.
- **`getChatHistory` has no cursor pagination.** The mobile `useChatHistory` hook is built with `useInfiniteQuery` (for forward compatibility) but the server returns the first 50 messages on every call. Adding cursor support requires backend work.
- **`getChatHistory` has no `ORDER BY` clause.** The `SELECT * FROM messages WHERE chat_id = ? LIMIT ?` query in `messages.service.ts:232-274` returns rows in arbitrary order, so the mobile chat screen's own sent messages can render off-screen or be de-duped by `keyExtractor` collisions when combined with an inverted `FlatList`. The mobile `withDateSeparators` now sorts ASCENDING client-side, which masks the symptom. The web happens to render correctly today because of `keyExtractor` dedup luck, but the right fix is to add `ORDER BY message_id ASC` (or `DESC`) to the server query.
- **Notifications + AI gateways do not yet accept `handshake.auth.cookie`.** Only `messages.gateway.ts` was updated for RN cookie-merge in this iteration. A mobile client trying to consume notifications or AI events would fail to authenticate. (Out of scope for this PR; tracked as a follow-up.)

### Mobile (apps/mobile)

- **No cursor pagination in `useChatHistory`.** Server returns the first 50 messages; older history is not loadable. `getNextPageParam` is stubbed to return `undefined` (no more pages).
- **No offline send queue.** If the socket is disconnected and the user sends a message, the optimistic insert is shown for up to 10 seconds, then rolled back with a "Couldn't send — tap to retry" toast. The message text isn't preserved for retry; the user has to retype.
- **No reconnection backfill.** If the socket disconnects mid-session, no `GET /chats/summary?since=<ts>` endpoint exists to fetch missed messages. The `AppState→active` listener only invalidates React Query, which refetches the entire summary.
- **Notifications socket not wired.** The mobile topbar has no notification bell yet, and `useNotificationsSocket` does not exist. The architecture (one shared socket) is ready for it; just needs the hook + bell.
- **Sender-self-echo in chat-history is correct, but optimistic `unread: !isActiveChat` is server-blind.** When the chat screen is open and a new message arrives, the list page's matching row gets `hasUnread: false` set optimistically. The server would still say `true` until the next `fetchChatSummary` (which happens on `AppState→active` or when the peer marks a message as read). In practice the chat screen calls `mark_read` immediately, so this is invisible — but the invariant isn't enforced. Same risk as the web's `useUnreadMessagesDot`.
- **Hardcoded socket config in `useMessagesSocket.ts`.** `reconnectionDelay: 1000`, `reconnectionDelayMax: 5000`, `reconnectionAttempts: 10` are inline constants. If a future caller needs different behavior, they'll need to refactor the singleton.
- **`useEnsureSummaryLoaded` only refetches when a cache exists but doesn't contain the chatId.** If the user lands on a chat detail with a _cold_ `['chat-summary', userId]` cache (no prior fetch), the hook is a no-op. The chat screen then renders with `summary === undefined` until the next general invalidation fires. Edge case; rare in practice.

### Backend test suite

- **Pre-existing web TS error in `apps/web/src/lib/auth-client.ts:8` (TS2742 — better-auth type portability).** Not introduced by this work. Untracked.
