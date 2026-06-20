# Messaging System Architecture

Hybrid REST + WebSocket (Socket.IO) real-time chat with dual-database persistence. Conversation metadata lives in **PostgreSQL** (via Prisma); messages live in **ScyllaDB** (Cassandra-compatible) for high-write throughput and time-series querying.

Three clients share the same backend:

- **Web** (`apps/web`, Next.js) — single React Query bus fed by a `SocketProvider` cache bus. The `SocketProvider` mounts at the root, owns TWO Socket.IO connections (messages + notifications), and writes WS events to the `['chat-summary', userId]` / `['chat-history', chatId]` React Query cache via pure updaters in `apps/web/src/lib/query/cacheUpdaters.ts`. All messaging pages (employer + candidate sidebars, in-page list, chat detail, employer dashboard) read from the same cache — no per-consumer `useState` for messages, no axios fetching in pages, no per-consumer `unread` state. AI events (`RESUME_PARSED_<u>`, `RESUME_SCORED_<u>`) ride the SAME messages socket via `useSocket()`. Mark-as-read uses a React Query `useMutation` that writes through the cache bus and times out after 10s; message send uses a React Query `useMutation` with optimistic `local-{uuid}` insert and real-`messageId` swap on ack.
- **Mobile** (`apps/mobile`, Expo / React Native) — **single persistent Socket.IO connection** managed by a `SocketProvider`; **React Query** as the cache and bus for `chat-summary` and `chat-history`; optimistic send with `local-{uuid}` → real `messageId` swap on ack; RN-specific WS config (forced `websocket` transport, `auth.cookie` for the WS upgrade, `/api` strip, function-form `auth`).
- **Backend** (`apps/backend`, NestJS) — three Socket.IO gateways (`messages`, `notifications`, `ai`); the messages gateway emits `new_message` to BOTH recipient and sender rooms for multi-device sync.

Both web and mobile bring the conversation list, chat detail, mark-as-read, real-time messaging, and unread badge to **both employer and candidate roles** (the candidate side mirrors the employer pages component-for-component — no separate component tree). The web was ported to the same React Query cache-bus pattern that mobile originally used to address the web's documented smells (sender-self-echo duplication, no React Query for messages, two sources of truth for unread).

---

## 1. Data Model

### 1a. PostgreSQL — Conversation Metadata

`apps/backend/prisma/schema.prisma:51-66`

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

Each user gets their **own row** for the same conversation. When A and B chat, two rows exist — `{ownerId: A, participantId: B}` and `{ownerId: B, participantId: A}` — sharing the same `scyllaChatId`. The `@@unique` constraint prevents duplicates.

### 1b. ScyllaDB — Messages (Cassandra)

Keyspace: `chat_app` (`apps/backend/src/lib/db.ts:20-24`)

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
- `message_id` — `TimeUuid` encoding the exact timestamp; no separate timestamp column
- `last_seen` — per-user read position for unread detection

### 1c. Backend Interfaces

`apps/backend/src/app/messages/messages.interface.ts`

```typescript
interface ChatSummaryResponse {
  chatId;
  participantId;
  participantName;
  participantRole;
  participantAvatar;
  latestMessage;
  hasUnread: boolean;
  lastMessageAt: Date;
  isActive: boolean;
}
interface ChatHistoryResponse {
  messages: {
    messageId;
    senderId;
    senderAvatar?;
    senderName?;
    content;
    timestamp: Date;
  }[];
}
```

### 1d. Frontend Types

**Web** — `apps/web/src/api-client/messages/types.ts` (55 lines, API + WS layer):

```typescript
interface ChatSummary {
  chatId;
  participantId;
  participantName: string | null;
  participantRole: string | null;
  participantAvatar: string | null;
  latestMessage: string | null;
  hasUnread;
  lastMessageAt: string | Date;
  isActive;
}
interface ChatMessage {
  messageId;
  senderId;
  senderAvatar?: string | null;
  senderName?: string | null;
  content;
  timestamp: string | Date;
  failed?: boolean; // UI-only optimistic state; never set by the server
}
interface SocketChatMessage {
  // alias re-exported as NewMessageEvent
  chatId;
  messageId;
  senderId;
  content;
  timestamp: string;
}
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
type MessageReadEvent = { friendId: string } | { by: string };
```

The WS discriminated unions (`SendMessageAck`, `MarkReadAck`, `MessageReadEvent`) live alongside the REST shapes in `apps/web/src/api-client/messages/types.ts:45-55` (the same file holds both the API types and the WS wire types — no separate `types/ws.ts` module). §2b mirrors these on the consumer side. Barrel re-exports from `apps/web/src/api-client/messages/index.ts` (19 lines).

**Web** — `apps/web/src/features/employer/messages/types.ts` (UI layer, 25 lines): adds `name`/`role`/`avatar`/`unread`/`isSent`/`showDateSeparator`/`dateLabel`/`timestamp24` to `Conversation`, and `failed?` to `Message` (mirrors the `ChatMessage.failed` flag — set by `useSendMessage.onError` to drive the failed-send indicator in `MessageBubble`).

**Mobile** — `apps/mobile/src/types/message.ts` (shared REST + WS wire):

```typescript
// REST — mirrors backend ChatSummaryResponse / ChatHistoryResponse
interface ChatSummary {
  chatId: string;
  participantId: string;
  participantName: string | null;
  participantRole: string | null;
  participantAvatar: string | null;
  latestMessage: string | null;
  hasUnread: boolean;
  lastMessageAt: string | Date;
  isActive: boolean;
}
interface ChatMessage {
  messageId: string;
  senderId: string;
  senderAvatar?: string | null;
  senderName?: string | null;
  content: string;
  timestamp: string | Date;
}
interface ChatHistoryResponse {
  messages: ChatMessage[];
}

// WebSocket wire
interface NewMessageEvent {
  chatId: string;
  messageId: string;
  senderId: string;
  content: string;
  timestamp: string;
}
type MessageReadEvent = { friendId: string } | { by: string };
interface SendMessageRequest {
  recipientId: string;
  text: string;
}
type SendMessageAck =
  | { status: 'ok'; messageId: string; timestamp: string }
  | { status: 'error'; error: string };
type MarkReadAck =
  | { status: 'ok'; lastReadAt: string }
  | { status: 'error'; error: string };
```

> **Field-shape deltas vs the doc's earlier rendering:** REST `participantName` / `participantRole` / `participantAvatar` / `latestMessage` are nullable in code; `lastMessageAt` and `ChatMessage.timestamp` accept `string | Date` (the server sends ISO strings; the UI calls `new Date(...)` at the boundary in `mapChatSummaryToConversation`).

**Mobile** — `apps/mobile/src/app/pages/employer/messages/types.ts` (UI layer): same shape as the web UI layer.

---

## 2. REST API

### 2a. Backend Controller

`apps/backend/src/app/messages/messages.controller.ts` — all endpoints prefixed `/chats`, protected by `@UseGuards(AuthGuard)`.

| Method | Endpoint                            | Purpose                                           |
| ------ | ----------------------------------- | ------------------------------------------------- |
| `GET`  | `/chats/summary?userId=`            | All conversations with unread status              |
| `GET`  | `/chats/history/:friendId?limit=50` | Message history with a specific user              |
| `POST` | `/chats/read/:friendId`             | Mark conversation as read                         |
| `POST` | `/chats/init/:friendId`             | Initialize a new conversation (idempotent upsert) |

### 2b. Frontend API Client

`apps/web/src/api-client/messages/public.ts` (73 lines, Axios, calls NestJS directly — no Next.js proxy):

```typescript
getChatSummary(userId)       → GET  /api/chats/summary?userId=
getChatHistory(friendId, 50) → GET  /api/chats/history/:friendId
markChatRead(friendId)       → POST /api/chats/read/:friendId
initConversation(friendId)   → POST /api/chats/init/:friendId
```

`getChatSummary` / `getChatHistory` / `initConversation` are no longer consumed directly by UI components — they are wrapped by React Query hooks in `apps/web/src/hooks/messaging/` (`useChatSummary`, `useChatHistory`, `useInitializeConversation`). The `markChatRead` REST function still exists but has **zero call sites** on the web (see §11).

`apps/mobile/src/api/messages.ts`:

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

Both use the shared `apiClient` (Axios + `withCredentials: true` + a request interceptor that attaches the Better Auth session cookie from SecureStore on mobile, or from the browser cookie jar on web).

---

## 3. WebSocket (Real-Time)

### 3a. Backend Gateway

`apps/backend/src/app/messages/messages.gateway.ts` — NestJS `@WebSocketGateway()`, no namespace, default `/socket.io` path.

**Connection authentication** (lines 31-49): reads `client.handshake.headers` and clones them. RN clients send the session via `client.handshake.auth.cookie` (the gateway merges it into `headers.cookie` only if `headers.cookie` is absent — browsers still take precedence). Session validated via `authService.validateToken(headers)`. On success, `client.join(userId)`; on failure, `client.disconnect()` — no anonymous connections.

| Event          | Handler                           | Description                                                                                                                                                 |
| -------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `send_message` | `handleSendMessage` (lines 65-81) | Persists to ScyllaDB; returns `{ status: 'ok', messageId, timestamp }` ack; emits `new_message` to **both** recipient and sender rooms (multi-device sync). |
| `mark_read`    | `handleMarkRead` (lines 83-93)    | Persists `last_read`; returns `{ status: 'ok', lastReadAt }` ack; emits `message_read` to both participants.                                                |

Both handlers are wrapped in `try/catch` and return `{ status: 'error', error }` on failure (no throw — clients get a typed error on the ack callback).

```typescript
// send_message flow (lines 65-81)
@SubscribeMessage('send_message')
async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageDTO) {
  const senderId = client.data.userId as string;
  try {
    const { messageId, timestamp } = await this.messagesService.sendMessage(senderId, dto);
    const chatId = MessagesService.getChatId(senderId, dto.recipientId);
    const payload = { chatId, messageId, senderId, content: dto.text, timestamp };
    this.server.to(dto.recipientId).emit('new_message', payload);
    // Sender (multi-device sync) — client de-dupes by messageId
    this.server.to(senderId).emit('new_message', payload);
    return { status: 'ok', messageId, timestamp };
  } catch (e) {
    return { status: 'error', error: (e as Error).message };
  }
}
```

`new_message` payload: `chatId`, `messageId`, `senderId`, `content`, `timestamp` (ISO string). Web ignores `chatId`/`messageId`; mobile uses both for de-dup and cache routing.

### 3b. Frontend WebSocket — web

Web has TWO parallel Socket.IO connections to the same backend (same `path: /socket.io`, same base URL, both `withCredentials: true`), owned by `SocketProvider` (§3c):

| Layer                | File                                                | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Messages socket      | `apps/web/src/hooks/useMessagesSocket.ts` (80)      | Module-level singleton `getOrCreateSocket()` (lines 15-41) + `emitSendMessage(dto)` / `emitMarkRead(friendId)` Promise wrappers with 10s ack timeouts (lines 43-70) that reject with `send_timeout_emitter` / `mark_read_timeout_emitter`. The `useMessagesSocket()` compat shim (lines 77-80) is a 3-line `useMemo(() => getOrCreateSocket(), [])`. **No callbacks live in this hook anymore** — all `new_message` / `message_read` listening is in `SocketProvider`.        |
| Notifications socket | `apps/web/src/hooks/useNotificationsSocket.ts` (89) | Own connection (`io()` at lines 47-52). Has `logDebug` console wrapper (lines 9-23) gated by `const DEBUG = true;`. Single-callback slot via `notificationCallbackRef.current = callback` (line 79, overwrite-on-set). `reconnection: true` with NO `reconnectionAttempts` cap (default backoff hammers forever on failure).                                                                                                                                                  |
| AI socket            | `apps/web/src/hooks/useAiSocket.ts` (96)            | **Rides the messages socket** via `useSocket()` from `SocketProvider` (line 13). Listens for `RESUME_PARSED_<userId>` and `RESUME_SCORED_<userId>` directly on `socket` (lines 88-93). Mounted globally via `<GlobalAiSocket />` inside `<SocketProvider>` in `apps/web/src/app/providers.tsx:25`. `useEffect` re-binds handlers on every render where `socket` / `isConnected` / `userId` / `pathname` / `router` change (deps at line 95) — no `useRef`, no overwrite-slot. |

- Messages socket: `withCredentials: true`, transports `['websocket', 'polling']`, reconnection capped at 10 attempts (1s–5s backoff). `emitSendMessage` / `emitMarkRead` REJECT with `send_timeout_emitter` / `mark_read_timeout_emitter` after 10s if the socket is disconnected or the ack never arrives. The web `useSendMessage.onError` catches the timeout and marks the optimistic message with `failed: true` (renders a red "Couldn't send" indicator under the bubble — see §5a step 6); `useMarkAsRead` silently ignores. Mobile `useSendMessage` still shows the legacy toast (see §11 mobile).
- Notifications socket: `reconnection: true` with default backoff (no cap — hammers forever on failure).
- 9 unguarded `console.log` calls in `getOrCreateSocket()` and `emitMarkRead` (`useMessagesSocket.ts:17,27,28,30,32,34,37,39,59`) — no `__DEV__` or `DEBUG` gate. The previous `const DEBUG = true;` gate is GONE.
- 2 unguarded `console.log` calls in `useAiSocket.ts:24,57` — no gate.

### 3c. Socket Context Provider (web)

`apps/web/src/contexts/socket-provider.tsx` (176 lines) — mounted at the root via `apps/web/src/app/providers.tsx:24` (the provider tree is `MantineProvider > SessionProvider > QueryClientProvider > SocketProvider > {<GlobalAiSocket />, children, <Toaster/>}`, 1-45). The provider:

- Calls `getOrCreateSocket()` (module-level singleton from `useMessagesSocket.ts:15-41`, stored in `useMemo` at line 56) for the messages connection.
- Calls `useNotificationsSocket()` (line 126) for the notifications connection.
- Subscribes to `new_message` (lines 68-83) and `message_read` (lines 84-95) once at the root. For each, the provider does BOTH the legacy `Set<callback>` fan-out (used by the bell hooks) AND writes to the React Query cache via pure updaters in `apps/web/src/lib/query/cacheUpdaters.ts`.
- For `new_message`: `queryClient.setQueriesData(['chat-summary'], applyNewMessageToSummary)` (bumps `latestMessage` + `lastMessageAt`, sets `hasUnread: true`, re-sorts the array) + `queryClient.setQueryData(['chat-history', chatId], applyNewMessageToHistory)` (two de-dup guards; preserves `senderAvatar` from the replaced local entry so the just-sent bubble keeps the sender's avatar after the WS echo replaces the `local-{uuid}` row — see §5a).
- For `message_read`: `queryClient.setQueriesData(['chat-summary'], applyMessageReadToSummary)` (sets `hasUnread: false` for the conversation whose `participantId` matches `readBy`).
- Tracks `connect` / `disconnect` to set `isConnected` state (line 50).
- Listens to `document.visibilitychange` + `window.focus` and invalidates `['chat-summary']` (lines 111-123) — a partial reconnect backfill (see §11).
- Exposes `socket`, `isConnected`, `activeChatId`, `setActiveChatId`, `onNewMessage(cb)`, `onMessageRead(cb)`, `onNewNotification(cb)` (lines 34-42) via the `useSocket()` hook.
- **`sendMessage` / `markAsRead` are NOT in the context.** Consumers import `emitSendMessage` / `emitMarkRead` directly from `@/hooks/useMessagesSocket` (used by `useSendMessage` at line 9 and `useMarkAsRead` at line 3).
- `Set<callback>`-based multi-subscriber pattern for `new_message`, `message_read`, `new_notification`. Per-subscriber errors are caught and logged as `console.error('[ws] subscriber error', e)` so one bad subscriber cannot break fan-out.
- **Auth model:** no explicit token in the WS handshake — `better-auth.session_token` HTTP-only cookie sent via `withCredentials: true`. Backend gateways call `authService.validateToken(handshake.headers)` and `client.disconnect()` on failure.

**Provider tree** (`apps/web/src/app/providers.tsx:1-45`):

```
MantineProvider
  └─ SessionProvider (better-auth)
       └─ QueryClientProvider (client={queryClient} from lib/query/queryClient.ts)
            └─ SocketProvider
                 ├─ <GlobalAiSocket />   ← line 25
                 ├─ children
                 └─ <Toaster position="bottom-right" richColors visibleToasts={5} /> ← line 27
```

### 3d. Mobile WebSocket Layer

`apps/mobile/src/hooks/useMessagesSocket.ts` — same `socket.io-client` package as the web (`^4.8.3`) with **four** mandatory RN-specific options:

```ts
// API_BASE_URL is `http://10.0.2.2:3000/api` (Android) / `http://localhost:3000/api` (iOS) —
// correct for REST. But socket.io treats everything after the host as a namespace, so
// passing the full URL would try to connect to namespace `/api` (the gateway never
// registered it → "Invalid namespace" on every connect). Strip /api.
const wsBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

_socket = io(wsBaseUrl, {
  path: '/socket.io',
  transports: ['websocket'], // RN can't do HTTP long-polling
  // Function form — re-reads the cookie on every connect/reconnect. Static form would
  // freeze whatever authClient.getCookie() returned at module-init (empty if the
  // session wasn't hydrated yet).
  auth: (cb) => cb({ cookie: authClient.getCookie() ?? '' }),
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
});
```

The socket is a **module-level singleton** (not a `useRef`) — deliberate fix for the web's "useMessagesSocket returns a new object every render" problem. One module load → one socket. Typed emit helpers (`emitSendMessage`, `emitMarkRead`) keep the rest of the codebase from importing `socket.io-client` directly.

**Connection observability:** one-line `[ws]` breadcrumb logs on `connect`, `disconnect`, `connect_error`, `reconnect`, `reconnect_attempt`, `reconnect_error`, `reconnect_failed`, plus module-load `init`, per-connect `auth`, and per-emit `mark_read`. `SocketProvider.tsx` adds a `[ws] message_read` log on the `message_read` event and `[ws] subscriber error` `console.error`s inside the `new_message` / `message_read` fan-out. `useMarkAsRead.ts` and `useMarkAsReadOnFocus.ts` add 8 `[mark-read]` log lines (mount / skip / ack / cached / error) between them. The legacy `apps/mobile/src/hooks/useMessageCandidate.ts` adds one `console.warn`. All unguarded by `__DEV__` — intentionally cheap production breadcrumbs so the next "WS doesn't work" symptom is one `adb logcat | grep [ws]` (or `grep [mark-read]`) away from a root cause.

### 3e. Mobile Socket Context Provider

`apps/mobile/src/contexts/SocketProvider.tsx` — mounted at the app root via `apps/mobile/src/app/_layout.tsx`, **inside `<QueryClientProvider>`** (uses `useQueryClient`). Owns the subscription registry (fix for the web's "single-callback slot" smell) and the cache bus.

```
useMessagesSocket.getOrCreateSocket()  ── module-level singleton
                                              │
SocketProvider owns the registry              │
                                              ├─ raw socket events (connect, disconnect, reconnect_*, error)
                                              ├─ subscription registry (Set<callback> per event)
                                              └─ AppState listener: queryClient.invalidateQueries(['chat-summary'])
                                                  on AppState change → 'active'  (no socket.connected gate — see §11)
```

Four pure cache updaters in `apps/mobile/src/contexts/cacheUpdaters.ts`:

- **`applyNewMessageToSummary(old, msg)`** — bumps `latestMessage` + `lastMessageAt`, sets `hasUnread = true` on the matching conversation (matched by `c.participantId === msg.senderId`), and re-sorts the full array by `lastMessageAt DESC` (matched row promoted to index 0; other rows re-sorted by timestamp — **not** a stable "bubble to top, keep order" sort). Returns `undefined` (not `[]`) when the cache is empty so a WS event arriving before the initial fetch never clobbers a not-yet-populated cache.
- **`applyMessageReadToSummary(old, readBy)`** — WS `message_read` side of the bus. Maps every `['chat-summary', *]` cache entry and sets `hasUnread = false` for the conversation whose `participantId` matches `readBy`. Partial-key `setQueriesData` because the provider has no closure over the current userId.
- **`applyNewMessageToHistory(old, msg)`** — appends to `pages[0]`, with two de-dup guards: (1) real `messageId` de-dup (catches sender-self-echo from multi-device, reconnect storms, the rare optimistic-send-swap race), (2) `localId` de-dup within a 5-second window (matches on `senderId` + `content` + close timestamp).
- **`applyMarkReadToSummary(old, chatId)`** — mutation-side mirror of `applyMessageReadToSummary`, called by `useMarkAsRead.onSuccess` to optimistically flip `hasUnread: false` for the conversation whose `chatId` matches.

**Provider `onNewMessage` flow:**

```
WS 'new_message'
  ├─ Set<NewMessageListener>.forEach (fan out)
  ├─ queryClient.setQueriesData(['chat-summary', *], applyNewMessageToSummary)
  │     - bumps lastMessage + lastMessageAt, hasUnread=true, bubbles to top
  ├─ queryClient.setQueryData(['chat-history', msg.chatId], applyNewMessageToHistory)
  │     - de-dup by real messageId, then de-dup by localId + content + time window
  └─ useUnreadDot reads ['chat-summary', userId] and recomputes its flag automatically
     (no manual state, no events, no fan-out — React Query is the bus)
```

**Provider `onMessageRead` flow** (self-sufficient — the previous design required a subscriber that never existed):

```
WS 'message_read'
  ├─ Set<MessageReadListener>.forEach (fan out — currently empty; reserved for future
  │   page-level subscribers)
  └─ queryClient.setQueriesData(['chat-summary', *], applyMessageReadToSummary)
        - partial-key pattern; matches by participantId
        - ensures unread clears regardless of which device the partner used
          to mark-as-read
```

### 3f. Connection lifecycle (mobile)

| Event                                      | Behavior                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `SocketProvider` mount                     | `getOrCreateSocket()` returns the singleton; `socket.connect()` runs once (idempotent)                           |
| `SocketProvider` unmount (e.g. hot reload) | Listeners cleaned up via `socket.off(...)`; socket stays alive so reconnect doesn't lose subscriptions           |
| Socket disconnect                          | `socket.io` auto-reconnects with backoff (1s, 2s, 4s, …, cap 5s, 10 attempts)                                    |
| All 10 attempts fail                       | `connect_error` logged; socket in a failed state (sends will time out)                                           |
| App backgrounded                           | Socket stays connected (matches web); ping/pong keeps the TCP socket warm                                        |
| App foregrounded                           | `AppState` listener invalidates `['chat-summary']` (no `socket.connected` guard — see §11)                       |
| Logout                                     | Out of scope (web doesn't handle it either — `client.disconnect()` only happens if `validateToken` returns null) |

---

## 4. Backend Service

`apps/backend/src/app/messages/messages.service.ts` — `getChatId(userA, userB)` is a `static` helper (promoted from `private static` in the mobile-compat refactor so the gateway can call it).

### `sendMessage(senderId, dto): Promise<{ messageId: string; timestamp: string }>` (lines 19-70)

1. `chatId = [senderId, recipientId].sort().join(':')`
2. `TimeUuid.now()` as message ID (encodes exact timestamp)
3. `INSERT INTO messages (chat_id, message_id, sender_id, content)` in ScyllaDB
4. Upsert **both** conversation rows in PostgreSQL via `Promise.all`
5. Return `{ messageId, timestamp: ISO }` (was `void`)

### `getChatListSummary(userId)` (lines 78-116)

1. Fetch all `conversation` rows for this user from PostgreSQL, ordered by `lastMessageAt DESC`
2. For each conversation, query `last_seen` for `last_read`; compare against latest message timestamp to determine `hasUnread`
3. Return enriched `ChatSummaryResponse[]` with participant details from User relation

### `getChatHistory(senderId, recipientId, limit)` (lines 232-274)

1. Compute `chatId` via the same deterministic formula
2. `SELECT * FROM messages WHERE chat_id = ? LIMIT ?` (no `ORDER BY` — see §11 backend)
3. Enrich each message with sender `name` / `avatarUrl` from PostgreSQL
4. Extract timestamp via `TimeUuid.getDate()` — no separate timestamp column

### `markAsRead(senderId, recipientId): Promise<string>` (lines 72-78)

`INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())` then return `new Date().toISOString()` (was `void`).

> **Eventual-consistency caveat:** the `INSERT` is acknowledged before the corresponding row is necessarily visible to a subsequent `SELECT last_read FROM last_seen …` (Scylla's default read consistency is `LOCAL_ONE`; a read on a different replica can return the pre-write state for a brief window). This is the reason the mobile `useMarkAsRead` hook intentionally does **not** call `invalidateQueries` in its `onSuccess` — a refetch fired immediately would observe the stale "no `last_seen`" state and overwrite the optimistic `hasUnread: false` with `hasUnread: true`. The natural `staleTime` (30 s), `AppState→active` invalidation, and subsequent WS `new_message` events all reconcile once Scylla settles.

### `createConversation(userId, participantId)` (lines 200-230)

Upsert conversation rows for both users in PostgreSQL (idempotent).

---

## 5. Frontend Pages & Components

### 5a. Web

| Route                 | File                                                            | Purpose                                                                                         |
| --------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/employer/messages`  | `apps/web/src/features/employer/messages/page.tsx` (148 lines)  | Employer messaging UI — now a 148-line RQ-backed coordinator                                    |
| `/candidate/messages` | `apps/web/src/features/candidate/messages/page.tsx` (154 lines) | Near-duplicate; reads `?recruiterId=` for deeplink (consistent with employer's `?candidateId=`) |

In-page components (all in `apps/web/src/features/employer/messages/`): `ConversationSidebar` (115 lines; search + unread dots, calls `onMarkAsRead()` on click), `ChatWindow` (169 lines; history, input, send), `MessageBubble` (60 lines; single message with date separators). The candidate page imports all three + `types` + `utils` from the employer folder (architectural smell — see §11). `app/employer/messages/page.tsx` and `app/candidate/messages/page.tsx` are 2-3 line re-exports of the `features/...` pages.

**Provider tree:** see §3c. The web is a React Query bus: `SocketProvider` writes WS events to the cache, and the pages read from it.

**Global navigation sidebars** (layout-level, render the blue "has unread" dot on the Messages item):

| Component          | File                                                    | Consumes                                                              |
| ------------------ | ------------------------------------------------------- | --------------------------------------------------------------------- |
| `EmployerSidebar`  | `components/employer/employerSidebar.tsx` (365 lines)   | `useUnreadDot(currentUser?.id)` at lines 24, 91; dot at 212, 242      |
| `CandidateSidebar` | `components/candidate/candidateSidebar.tsx` (249 lines) | `useUnreadDot(currentUser?.id)` at lines 31, 162; dot at 112-114, 116 |

`useUnreadDot` (`apps/web/src/hooks/messaging/useUnreadDot.ts`, 12 lines) is a role-agnostic selector: `(summaries ?? []).some(s => s.hasUnread)`. It reads from the React Query `['chat-summary', userId]` cache. The employer dashboard's `messageCount` (`apps/web/src/features/employer/dashboard/page.tsx:54-61`) reads from the SAME cache via its own `useQuery({queryKey: ['chat-summary', user.id]})`. The result: the sidebar dot, the in-page list, and the dashboard counter see the same `hasUnread` value — no asymmetric state, no separate "refetch on event" logic. (Mirrors mobile's `useUnreadDot` — see §5b mobile for the role-agnostic refactor.)

The topbar **bell** with numeric `99+` badge is a separate flow: it consumes the **notifications** socket via `useNotifications()` (`apps/web/src/hooks/useNotifications.ts:186`) and renders in `candidateTopBar.tsx:88-92` / `employerTopBar.tsx:131-135`. Independent of the Messages sidebar dot.

**Web page flow** (`features/employer/messages/page.tsx`, 148 lines):

1. **Mount** → `useChatSummary(userId)` (React Query, `hooks/messaging/useChatSummary.ts:1-16`) returns `summaries` → `useMemo` maps to `Conversation[]` via `mapChatSummaryToConversation` (lines 34-37).
2. **`?candidateId=` deeplink** → `useSearchParams` reads `candidateId` (line 20) and auto-selects the matching conversation (lines 49-58). Mirrors the candidate page's `?recruiterId=` flow (line 22, 55-64).
3. **Select conversation** → `ConversationSidebar.handleSelectConversation` (line 36-39) calls `onMarkAsRead()`, which the page wires to `() => markAsRead.mutate()` (line 98, 125). The page also calls `useMarkAsReadOnFocus({chatId, friendId, userId})` (line 65) which fires the same mutation on mount + on `document.visibilitychange` → visible / `window.focus` (`useMarkAsReadOnFocus.ts:38-47, 50-61`), debounced 500ms. **Known smell**: clicking a conversation fires `mark_read` twice — once from the sidebar, once from the focus hook's mount effect. Idempotent on the server but wasteful.
4. **`useMarkAsRead` mutation** (`hooks/messaging/useMarkAsRead.ts`, 56 lines) — 10s ack safety timeout (lines 22-24). On success, `setQueriesData({queryKey: ['chat-summary']}, applyMarkReadToSummary)` writes `hasUnread: false` for the matching chatId (lines 41-49). **Does NOT call `invalidateQueries`** — would race Scylla's eventual consistency and clobber the optimistic write (see §4 backend's `markAsRead` caveat).
5. **Chat detail** → `ChatWindow` reads `chat-history` via `useChatHistory(chatId, participantId)` (infinite query, cursor stubbed), renders `MessageBubble`s with `useSendMessage` for input. The page itself does NOT touch the WS layer.
6. **`useSendMessage` mutation** (`hooks/messaging/useSendMessage.ts`, 119 lines):
   - `Opts` (lines 11-16) accepts `currentUserAvatar?: string | null` from the page. The page sources it from the profile context (employer: `useGetEmployerProfile().data?.avatarUrl`; candidate: `useGetCandidateProfile().data?.avatarUrl`).
   - `onMutate`: optimistic insert with `messageId: \`local-${crypto.randomUUID()}\``(line 59) AND`senderAvatar: opts.currentUserAvatar ?? null`(line 68) into`['chat-history', chatId]` cache. The `senderAvatar` is what makes the just-sent bubble show the real avatar instead of the `placehold.co/40x40` fallback.
   - `emitSendMessage(dto)` rejects with `send_timeout_emitter` after 10s if the socket is disconnected (see §3b).
   - `onSuccess`: maps `pages[0]` and swaps `m.messageId === localIdRef.current` → real `ack.messageId` (lines 79-96) via `{ ...m, messageId, timestamp }` — preserves `senderAvatar` from the optimistic entry. The `localId` row is then replaced by the cache layer's 5-second `localId` de-dup guard when the WS echo arrives (see §5a sender-self-echo below); `applyNewMessageToHistory` spreads the local entry's fields into the replacement so `senderAvatar` survives the swap.
   - `onError`: marks the optimistic message with `failed: true` in `pages[0]` and clears `localIdRef` — does **not** filter it out. `MessageBubble` reads the flag and renders a red `AlertCircle` + "Couldn't send" line below the bubble's timestamp. No toast. The user retypes and resends manually; on reload the `local-*` message disappears because the server never knew about it. (The 10s emitter timeout and the ack-error path both flow through this same handler, so the same indicator shows regardless of failure mode.)
7. **Receive `new_message`** (handled by `SocketProvider`, NOT by the page):
   - `applyNewMessageToSummary` (`lib/query/cacheUpdaters.ts:13-35`) writes `latestMessage` + `lastMessageAt` + `hasUnread: true` to the matching conversation; re-sorts the array by `lastMessageAt DESC` (the matching row is promoted to index 0, others re-sorted by timestamp).
   - `applyNewMessageToHistory` (`lib/query/cacheUpdaters.ts:57-95`) appends to `pages[0]` with TWO de-dup guards: (1) real `messageId` de-dup (catches sender-self-echo from multi-device, reconnect storms, optimistic-send-swap races) (line 63); (2) `localId` de-dup within a 5-second window (matches on `senderId` + `content` + close timestamp) (lines 65-71) — this is the port of mobile's sender-self-echo fix. When the `localId` de-dup matches, the replacement entry spreads the local entry's fields via `{ ...first[localIdx], messageId, senderId, content, timestamp }` (lines 77-83) — this preserves `senderAvatar` (and any other client-only fields like `failed`) that the WS payload doesn't carry. Without this spread, the just-sent bubble would flash the correct avatar from the optimistic entry and then revert to the `placehold.co/40x40` placeholder once the WS echo replaces the local row.
   - All consumers of `['chat-summary', userId]` and `['chat-history', chatId]` re-render automatically.
8. **Receive `message_read`** (handled by `SocketProvider`):
   - `applyMessageReadToSummary` (`lib/query/cacheUpdaters.ts:30-36`) sets `hasUnread: false` for the conversation whose `participantId` matches `readBy`. Closes the "partner reads on their device" gap.
9. **App regains focus** → `SocketProvider` invalidates `['chat-summary']` on `document.visibilitychange` → visible / `window.focus` (lines 111-123). Partial reconnect backfill.

### 5b. Mobile

| Route                          | File                                                        | Purpose                                                                             |
| ------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `/employer/messages`           | `apps/mobile/src/app/pages/employer/messages/index.tsx`     | Conversation list with `FlatList`, search, pull-to-refresh, unread blue dot per row |
| `/employer/messages/[chatId]`  | `apps/mobile/src/app/pages/employer/messages/[chatId].tsx`  | Chat detail: header, `FlatList` of `MessageBubble`s (inverted), `MessageInput`      |
| `/candidate/messages`          | `apps/mobile/src/app/pages/candidate/messages/index.tsx`    | Candidate-side mirror of the employer list page; uses `useGetCandidateProfile`      |
| `/candidate/messages/[chatId]` | `apps/mobile/src/app/pages/candidate/messages/[chatId].tsx` | Candidate-side mirror of the employer chat detail                                   |

| Component                                                 | File                                                               | Purpose                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EmployerDashboardSidebar`                                | `pages/employer/dashboard/components/EmployerDashboardSidebar.tsx` | Sidebar with blue dot on "Messages" via `useUnreadDot(employerProfile?.id)`                                                                       |
| `MessageListItem`                                         | `pages/employer/messages/components/MessageListItem.tsx`           | Row with avatar/name/timestamp/preview, unread blue dot (testID `unread-dot`)                                                                     |
| `MessagesSearchBar` / `MessagesLoading` / `MessagesError` | `…/components/`                                                    | Search, spinner, inline error with retry                                                                                                          |
| `ChatHeader` / `MessageBubble` / `MessageInput`           | `…/components/`                                                    | Back button + avatar + name + role, single message (testID `bubble-sent`/`bubble-received`), multiline input + send button (testID `send-button`) |
| `ChatEmptyState` / `ChatLoading` / `ChatError`            | `…/components/`                                                    | Empty state, spinner, chat error with Try again / Back                                                                                            |

**Both candidate and employer routes share the same component tree.** The candidate pages (`pages/candidate/messages/…`) import every component in the table above from `../../employer/messages/components/…` — feature code physically under `employer/` but consumed by both roles. Mirrors the web's smell (`features/candidate/messages` imports from `features/employer/messages`) and is documented as such in §11.

**List screen flow** (`pages/employer/messages/index.tsx`):

1. Mount → `useGetEmployerProfile()` resolves userId → `useChatSummary(userId)` fires `GET /chats/summary?userId=`
2. React Query auto-refetches on `AppState→active` and on `refetchOnReconnect`
3. `ChatSummary[]` → `Conversation[]` (UI) via `mapChatSummaryToConversation`
4. `FlatList` renders rows; `MessagesSearchBar` client-side filters by name + last message
5. `MessageListItem` shows the unread blue dot when `unread === true`
6. Tap → `router.push({ pathname: '/employer/messages/[chatId]', params: { chatId } })`

**Chat screen flow** (`pages/employer/messages/[chatId].tsx`):

1. `useLocalSearchParams<{ chatId }>()` reads chatId from the route
2. `useChatSummary(userId).data.find(c => c.chatId === chatId)` looks up metadata; `useEnsureSummaryLoaded` refetches once if missing (cold-cache deeplink)
3. `useChatHistory(chatId, participantId)` (infinite query — server returns the first 50, no cursor yet)
4. Pages flattened + sorted ASCENDING by timestamp, then decorated with `withDateSeparators` (Today / Yesterday / MMM D — no year). Sort is client-side because the backend `getChatHistory` has no `ORDER BY`.
5. `useMarkAsReadOnFocus` (debounced 500ms) fires `mark_read` on mount + on `AppState→active` while the screen is open. Both effects are gated on `opts.friendId` being non-empty; the AppState effect's dep array is `[opts.friendId]` only, so a `chatId` change without a `friendId` change leaves a stale `chatId` in the handler's closure (logged but inert in practice — see §11).
6. `useSendMessage` mutation: optimistic insert with `local-{uuid}` at the head of `pages[0]` → emit over WS → on ack, swap `localId` → real `messageId` and update the row's `timestamp`; on ack error or 10-second timeout, roll back the optimistic insert and show a `Toast.show({type:'error', text1:"Couldn't send", text2:'Tap to retry', onPress: …})`. **Known smell:** the toast's `onPress` body is an empty stub (comment: "the user can re-tap the Send button themselves; this is a UX nicety") — the "Tap to retry" string is misleading; tapping the toast does nothing, and the user has to retype in the input. `lastTextRef` is captured but never read by any retry handler. See §11.
7. `FlatList` is **not inverted** — it renders the array in order and calls `scrollToEnd({animated: true})` inside a `useEffect` keyed on `messages.length` (the visual result is identical to an inverted list for a chat scrolled to the bottom). `keyExtractor` keys on `messageId`, which catches the de-duped sender-self-echo from the cache layer.
8. WS `new_message` events are handled by `SocketProvider` (not by this screen): the `['chat-history', chatId]` cache is updated with two de-dup guards (real `messageId` then `localId`+`content`+5s window), and React Query re-renders this screen automatically. Sender-self-echo is dropped at the cache layer. The screen does **not** import or call `useSocket()` — the `useSocket` export on `SocketProvider` has zero call sites in the repo.

---

## 6. Architecture Diagram

```
┌───────────────────────────────────────┐          ┌─────────────────────────────────────────┐
│  Web Frontend (Next.js)               │          │  Backend (NestJS)                       │
│                                       │          │                                         │
│  Providers (app/providers.tsx:1-45)   │          │  MessagesGateway    (room = userId)     │
│  ├─ MantineProvider                   │          │  ├─ handleConnection                   │
│  ├─ SessionProvider                   │          │  │   auth via handshake.headers.cookie   │
│  ├─ QueryClientProvider               │          │  │   OR handshake.auth.cookie  ← RN      │
│  │   (client = lib/query/queryClient) │          │  ├─ @SubscribeMessage('send_message')   │
│  │   staleTime: 30s, refetchOnReconnect│          │  │   ack {status,messageId,ts}; emit     │
│  └─ SocketProvider  (Context)         │          │  │   new_message to recipient + sender   │
│     ├─ getOrCreateSocket() ───────────┼───WS #1──┤  ├─ @SubscribeMessage('mark_read')      │
│     │  (useMessagesSocket.ts singleton)│          │  │   ack {status,lastReadAt}; emit       │
│     │  + emitSendMessage / emitMarkRead│          │  │   message_read to both parties        │
│     │  (10s ack timeouts)              │          │  └─                                     │
│     │                                  │          │                                         │
│     ├─ useNotificationsSocket() ──────┼───WS #2──┤  NotificationsGateway (room =           │
│     │  new_notification (incoming)     │          │   notifications:<userId>)              │
│     │                                  │          │  AiGateway (room = userId)              │
│     └─ Cache Bus (lib/query/cache…)    │          │                                         │
│        ├─ applyNewMessageToSummary     │          │  MessagesController (REST)              │
│        │  → setQueriesData(['chat-     │          │  ├─ GET  /chats/summary                  │
│        │     summary'], …)             ┼──HTTP────┼─▶ ├─ GET  /chats/history/:friendId        │
│        │  DESC re-sort, hasUnread=true │          │  ├─ POST /chats/read/:friendId           │
│        ├─ applyNewMessageToHistory     │          │  └─ POST /chats/init/:friendId           │
│        │  → setQueryData(['chat-       │          │                                         │
│        │     history', chatId], …)     │          │  MessagesService                        │
│        │  real + 5s localId de-dup     │          │  ├─ sendMessage → {messageId, ts}        │
│        ├─ applyMessageReadToSummary    │          │  ├─ getChatListSummary                  │
│        │  → setQueriesData(['chat-     │          │  ├─ getChatHistory                      │
│        │     summary'], …)             │          │  ├─ markAsRead → ISO string             │
│        │  hasUnread=false on match     │          │  └─ createConversation                  │
│        ├─ visibilitychange/focus       │          │                                         │
│        │  → invalidate(['chat-summary'])│          │                                         │
│        └─ Set<callback> pub/sub fan-out │          │                                         │
│                                       │          │                                         │
│  Global Sidebars (useUnreadDot)       │          │                                         │
│  ├─ EmployerSidebar (365)              │          │                                         │
│  └─ CandidateSidebar (249)             │          │                                         │
│                                       │          │                                         │
│  Topbar Bell (useNotifications)        │          │                                         │
│  ├─ EmployerTopBar (242)               │          │                                         │
│  └─ CandidateTopBar (193)              │          │                                         │
│                                       │          │                                         │
│  Pages / In-page Components           │          │                                         │
│  ├─ /employer/messages (148)           │          │                                         │
│  │  useChatSummary(userId)             │          │                                         │
│  │  ?candidateId= deeplink             │          │                                         │
│  │  useMarkAsRead / useMarkAsReadOnFocus│         │                                         │
│  │  → <ConversationSidebar> <ChatWindow>│          │                                        │
│  │  <ChatWindow>                       │          │                                         │
│  │    useChatHistory (infinite RQ)     │          │                                         │
│  │    useSendMessage (RQ mutation)     │          │                                         │
│  │    local-{uuid} → real messageId    │          │                                         │
│  ├─ /candidate/messages (154)          │          │                                         │
│  │  reuses employer comps              │          │                                         │
│  │  ?recruiterId= deeplink             │          │                                         │
│  ├─ ConversationSidebar (115)          │          │                                         │
│  ├─ ChatWindow (169)                   │          │                                         │
│  └─ MessageBubble (60)                 │          │                                         │
│                                       │          │                                         │
│  Dashboard (employer)                  │          │                                         │
│  └─ /employer/dashboard               │          │                                         │
│     useQuery(['chat-summary', user.id])│          │                                         │
│     messageCount = .filter(hasUnread)  │          │                                         │
└───────────────────────────────────────┘          │                                         │
┌───────────────────────────────────────┐          │  ┌──────────────┐ ┌──────────────┐     │
│  Mobile (Expo / React Native)         │          │  │   ScyllaDB   │ │  PostgreSQL  │     │
│                                       │          │  │  messages    │ │  user        │     │
│  app/_layout.tsx                      │          │  │  last_seen   │ │  conversation│     │
│  └─ <SocketProvider>                  │          │  └──────────────┘ └──────────────┘     │
│     └─ <QueryClientProvider>          │          │                                         │
│        └─ <Stack>                     │          │  JoblyIoAdapter (Redis pub/sub         │
│           ├─ /employer/messages       │          │   optional, in-memory fallback)        │
│           │  useChatSummary (RQ)      │          │                                         │
│           │  MessageListItem (dot)    │          └─────────────────────────────────────────┘
│           │  tap → router.push        │                              ▲
│           ├─ /employer/messages/[id]  │                              │
│           │  useChatHistory (infinite)│                              │
│           │  useSendMessage           │                              │
│           │  useMarkAsReadOnFocus     │                              │
│           ├─ /candidate/messages      │                              │
│           │  reuses employer comps    │                              │
│           └─ /candidate/messages/[id] │                              │
│                                       │                              │
│  contexts/SocketProvider.tsx          │                              │
│  ├─ getOrCreateSocket() (singleton) ──┼───WS #1──────────────────────┘
│  │    transports: ['websocket']       │        single connection; auth.cookie merged server-side
│  │    reconnection: 10 attempts       │        (strips /api from API_BASE_URL; function-form auth)
│  ├─ Set<cb> fan-out                   │
│  ├─ cacheUpdaters (pure)              │
│  │    applyNewMessageToSummary        │
│  │    applyMessageReadToSummary       │
│  │    applyMarkReadToSummary          │
│  │    applyNewMessageToHistory (de-dup)
│  └─ AppState listener → invalidate    │
│                                       │
│  hooks/messaging/                     │
│  ├─ useChatSummary (RQ ['chat-summary', userId])
│  ├─ useChatHistory (RQ infinite)      │
│  ├─ useSendMessage (mutation + 10s timeout)
│  ├─ useMarkAsRead (WS mutation, partial-key setQueriesData)
│  ├─ useMarkAsReadOnFocus (debounced, friendId-gated)
│  ├─ useUnreadDot (reads ['chat-summary', userId])
│  ├─ useEnsureSummaryLoaded (cold-cache refetch)
│  ├─ useInitConversation               │
│  └─ useMessageCandidate               │
│                                       │
│  EmployerDashboardSidebar ─ useUnreadDot(employerProfile?.id)
│  CandidateDashboardSidebar ─ useUnreadDot(candidateProfile?.id)
└───────────────────────────────────────┘
```

### Mobile WS fan-out (React Query bus)

```
Backend MessagesGateway emits 'new_message'  →  SocketProvider's raw socket listener
                                                 ├─ Set<NewMessageListener>.forEach (fan out)
                                                 ├─ queryClient.setQueriesData(['chat-summary', *],
                                                 │     applyNewMessageToSummary) — timestamp DESC re-sort
                                                 ├─ queryClient.setQueryData(['chat-history', msg.chatId],
                                                 │     applyNewMessageToHistory) — messageId + localId de-dup
                                                 └─ useUnreadDot reads ['chat-summary', userId] and
                                                    recomputes its flag automatically

The chat screen [chatId].tsx doesn't subscribe to onNewMessage at all — React Query
re-renders it when the chat-history cache changes. (It also does not import
useSocket; SocketProvider owns the only subscription in the app.)
```

---

## 7. Conversation Initiation Flow

### 7a. Web

`apps/web/src/hooks/useMessageCandidate.ts` (42 lines) — employer-side conversation initiator. Imports `useInitializeConversation` from `@/hooks/messaging/useInitializeConversation` (line 3, 16). On click: `useInitializeConversation.initChat(userId, targetId)` (a `useCallback` wrapper at `hooks/messaging/useInitializeConversation.ts:1-68`, 68 lines) — checks existing via `getChatSummary()`; if none, `POST /api/chats/init/:friendId` (REST) → upserts both rows → refetches the React Query `chat-summary` cache → navigates to `/employer/messages?candidateId=${candidateId}` (line 31). Two live callers: `components/employer/jobApplicantsTable.tsx:28,256` and `components/employer/allApplicationsTable.tsx:28,287`.

The `?candidateId=` deeplink IS read on the employer side at `apps/web/src/features/employer/messages/page.tsx:19-20, 49-58` — the page uses `useSearchParams` and auto-selects the matching conversation. The candidate page does the same for `?recruiterId=` at `apps/web/src/features/candidate/messages/page.tsx:22, 55-64`. Both pages are consistent.

**Candidate side has its own parallel flows**, both using `useInitializeConversation` directly:

- `apps/web/src/features/candidate/applications/page.tsx:34, 136-137` — `await initChat(user.id, item.recruiterId); router.push(\`/candidate/messages?recruiterId=${item.recruiterId}\`);`
- `apps/web/src/features/candidate/dashboard/page.tsx:35, 89-90` — same pattern.

`useInitializeConversation` has 3 callers total: `useMessageCandidate` (via top-level), the candidate applications page, the candidate dashboard page. The dead `useInitConversation` hook has been deleted; the dedicated `useMarkChatRead` hook is also gone — see §11.

---

## 8. Unread Tracking

### 8a. Backend (ScyllaDB `last_seen`)

- `INSERT INTO last_seen (user_id, chat_id, last_read) VALUES (?, ?, now())` sets current timestamp
- `getChatDetailsByChatId` (lines 119-198) compares latest message `TimeUuid` timestamp vs `last_read`:
  - No `last_read` row + message from other user → unread
  - `message_timestamp > last_read_timestamp` → unread
  - Latest message sent by current user → not unread
- The unread flag is a **per-conversation boolean** — no numeric counter anywhere. `ChatSummary.hasUnread: boolean` is the only field on the wire.
- The topbar **bell** `unreadCount` (driven by `useNotifications`) is a **separate, numeric** counter for `Notification` rows. The two do not interact.

### 8b. Web — single React Query bus

The web has collapsed what was previously a "two consumer paths" model into one source of truth: the `['chat-summary', userId]` React Query cache. The in-page list, the global sidebar dot, and the employer dashboard's `messageCount` all read from the same cache via `useQuery`. There is no separate "list unread" state and no separate "sidebar dot" state.

- **WS `new_message`** → `SocketProvider` runs `applyNewMessageToSummary` (`lib/query/cacheUpdaters.ts:13-28`) → cache updated → every consumer of `['chat-summary', userId]` (the in-page list, the sidebar's `useUnreadDot`, the dashboard's `messageCount`, the chat detail's metadata lookup) re-renders with the same `hasUnread` value. No asymmetry.
- **WS `message_read`** → `SocketProvider` runs `applyMessageReadToSummary` (`lib/query/cacheUpdaters.ts:30-36`) → cache updated for the matching `participantId`. This handles the case where the **partner** marks a chat as read on their own device — previously the cache could only be cleared by your own `mark_read` mutation.
- **Own `mark_read` mutation** → `useMarkAsRead.onSuccess` runs `applyMarkReadToSummary` (matching on `chatId`). All three paths (WS `new_message`, WS `message_read`, own `mark_read` mutation) write to the same React Query cache key, so the dot clears the moment any one of them fires.
- **Page regains focus** → `SocketProvider` invalidates `['chat-summary']` (lines 111-123). Partial backfill.

This is the same single-cache-bus pattern as mobile (§8d) — the doc's "two sources of truth" smell is closed for the web.

### 8d. Mobile — single React Query bus

The mobile client **collapses both web concerns into one source of truth**: the `['chat-summary', userId]` React Query cache. No separate "list unread" state and no separate "sidebar dot" state.

- **WS `new_message`** → `SocketProvider` runs `applyNewMessageToSummary` → cache updated → every consumer of `['chat-summary', userId]` (the list page, the sidebar's `useUnreadDot`, the chat screen's metadata lookup) re-renders. The list and the sidebar see the **same `hasUnread` value**. No asymmetry.
- The cache is **also updated** for incoming messages from other users; the list page's row gets `hasUnread: true` optimistically. Self-correcting on the next `fetchChatSummary` refetch — triggered by `AppState→active` or by the peer marking a message as read.
- `useUnreadDot` (`apps/mobile/src/hooks/messaging/useUnreadDot.ts`) is three lines: `(summaries ?? []).some(s => s.hasUnread)`. No events, no manual state. The hook takes a `userId?: string` and is **role-agnostic** — `EmployerDashboardSidebar` passes `employerProfile?.id`, `CandidateDashboardSidebar` passes `candidateProfile?.id`. The hook itself knows only about React Query.
- **WS `message_read`** → `SocketProvider` runs `applyMessageReadToSummary` → cache updated for the matching `participantId`. This handles the case where the **partner** marks a chat as read on their own device — previously the cache could only be cleared by your own `mark_read` mutation.
- **Own `mark_read` mutation** → `useMarkAsRead.onSuccess` runs `applyMarkReadToSummary` (mutation-side mirror, matching on `chatId` instead of `participantId`). Both WS paths and the mutation path write to the same React Query cache key, so the dot clears the moment any one of them fires.

This is the single change that **fixes the web's "two sources of truth for unread" smell** for the mobile client.

---

## 9. Key Files Reference

### Backend (`apps/backend/src/`)

| File                                         | Role                                                                                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `app/messages/messages.module.ts`            | Registers controller, gateway, service                                                                                        |
| `app/messages/messages.controller.ts`        | REST endpoints for chat CRUD                                                                                                  |
| `app/messages/messages.gateway.ts` (1-104)   | Socket.IO gateway: real-time messaging, RN cookie-merge, typed acks, sender-self-echo                                         |
| `app/messages/messages.service.ts` (1-274)   | Core business logic; `getChatId` is `static`; `sendMessage` returns `{messageId, timestamp}`; `markAsRead` returns ISO string |
| `app/messages/messages.interface.ts`         | TypeScript interfaces                                                                                                         |
| `app/messages/dto/sendMessageDTO.ts`         | Validation DTO (`recipientId` + `text`)                                                                                       |
| `app/notifications/notifications.gateway.ts` | `new_notification` (room `notifications:<userId>`) — **not yet updated with RN cookie-merge** (out of scope)                  |
| `app/ai/ai.gateway.ts`                       | AI event gateway (`RESUME_PARSED_<u>` / `RESUME_SCORED_<u>`) — **not yet updated with RN cookie-merge** (out of scope)        |
| `app/common/adapter/jobly-io.adapter.ts`     | Custom IoAdapter with optional Redis pub/sub                                                                                  |
| `app/common/filter/ws-exceptions.filter.ts`  | WebSocket exception filter                                                                                                    |
| `app/auth/auth.service.ts:36-45`             | `validateToken()` used by all three gateways                                                                                  |
| `lib/db.ts:1-24`                             | DB connection singletons (ScyllaDB, Prisma, Redis)                                                                            |
| `prisma/schema.prisma:51-66`                 | Conversation model                                                                                                            |
| `main.ts:56-58`                              | Wires the `JoblyIoAdapter` into NestJS                                                                                        |

### Frontend — web (`apps/web/src/`)

| File                                                                                            | Role                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/providers.tsx:1-45`                                                                        | Root provider tree: `MantineProvider > SessionProvider > QueryClientProvider > SocketProvider > {<GlobalAiSocket />, children, <Toaster/>}`; mounts `SocketProvider` at line 24, `<GlobalAiSocket />` at line 25, `<Toaster>` at line 27                 |
| `app/employer/messages/page.tsx`, `app/candidate/messages/page.tsx`                             | Thin re-exports of `features/.../page.tsx` (2-3 lines each)                                                                                                                                                                                              |
| `app/employer/layout.tsx:79`, `app/candidate/layout.tsx:26`                                     | Mount the global sidebars                                                                                                                                                                                                                                |
| `features/employer/messages/page.tsx` (157)                                                     | Employer messaging page (RQ-backed coordinator: `useChatSummary`, `?candidateId=` deeplink, `useMarkAsRead` + `useMarkAsReadOnFocus`; also mounts `useGetEmployerProfile()` to derive `currentUserAvatar` and threads it into `<ChatWindow>` so the just-sent bubble shows the sender's real avatar; NO direct WS code) |
| `features/candidate/messages/page.tsx` (163)                                                    | Near-duplicate; reads `?recruiterId=` consistently with the employer page; mounts `useGetCandidateProfile()` for `currentUserAvatar`                                                                                                                                                                                |
| `features/employer/messages/ChatWindow.tsx` (172)                                               | Right panel: message history, input, send; accepts `currentUserAvatar?: string \| null` and forwards it to `useSendMessage`                                                                                                                                                                                          |
| `features/employer/messages/ConversationSidebar.tsx` (115)                                      | Left panel: searchable list, calls `onMarkAsRead()` on click                                                                                                                                                                                             |
| `features/employer/messages/MessageBubble.tsx` (60)                                             | Individual message renderer                                                                                                                                                                                                                              |
| `features/employer/messages/types.ts` (24), `utils.ts` (142)                                    | UI types + date/avatar/display helpers                                                                                                                                                                                                                   |
| `components/employer/employerSidebar.tsx` (365; useUnreadDot at 24, 91; dot at 212, 242)        | Global nav sidebar (uses `useUnreadDot(currentUser?.id)`)                                                                                                                                                                                                |
| `components/candidate/candidateSidebar.tsx` (249; useUnreadDot at 31, 162; dot at 112-114, 116) | Global nav sidebar (uses `useUnreadDot(currentUser?.id)`)                                                                                                                                                                                                |
| `components/employer/employerTopBar.tsx` (242; bell at 131-135)                                 | Topbar with notification bell (`useNotifications`)                                                                                                                                                                                                       |
| `components/candidate/candidateTopBar.tsx` (193; bell at 88-92)                                 | Topbar with notification bell (`useNotifications`)                                                                                                                                                                                                       |
| `features/employer/dashboard/page.tsx` (54-61)                                                  | Employer dashboard reads from `['chat-summary', userId]` cache (`messageCount = summaries?.filter(c => c.hasUnread).length ?? 0`)                                                                                                                        |
| `contexts/socket-provider.tsx` (176)                                                            | RQ cache bus; owns 2 Socket.IO clients; `Set<callback>` pub/sub; `document.visibilitychange`/`window.focus` invalidation; exposes `useSocket()`                                                                                                          |
| `hooks/useMessagesSocket.ts` (80)                                                               | Module-level singleton `getOrCreateSocket()` + `emitSendMessage` / `emitMarkRead` Promise wrappers (10s timeouts); `useMessagesSocket()` is a 3-line compat shim                                                                                         |
| `hooks/useNotificationsSocket.ts` (89)                                                          | Notifications socket (`new_notification`); `logDebug` console wrapper gated by `const DEBUG = true;`; single-callback `useRef` slot                                                                                                                      |
| `hooks/useAiSocket.ts` (96)                                                                     | AI listeners (`RESUME_PARSED_<u>`, `RESUME_SCORED_<u>`) on the SAME messages socket via `useSocket()`                                                                                                                                                    |
| `hooks/useNotifications.ts` (186)                                                               | Topbar bell state from `useNotificationsSocket`                                                                                                                                                                                                          |
| `hooks/useMessageCandidate.ts` (42)                                                             | Conversation initiator (navigates with `?candidateId=`); imports `useInitializeConversation` from `hooks/messaging/`                                                                                                                                     |
| `hooks/useUser.ts` (78)                                                                         | `User` type + session hook (better-auth)                                                                                                                                                                                                                 |
| `hooks/messaging/useChatSummary.ts` (16)                                                        | RQ wrapper: `useQuery({queryKey: ['chat-summary', userId], staleTime: 30_000})`                                                                                                                                                                          |
| `hooks/messaging/useChatHistory.ts` (18)                                                        | RQ `useInfiniteQuery` (cursor stubbed)                                                                                                                                                                                                                   |
| `hooks/messaging/useEnsureSummaryLoaded.ts` (28)                                                | Cold-cache refetch for `?candidateId=` / `?recruiterId=` deeplinks                                                                                                                                                                                       |
| `hooks/messaging/useInitializeConversation.ts` (68)                                             | `useCallback` wrapper over `getChatSummary` + `POST /chats/init/:friendId`; 3 callers                                                                                                                                                                    |
| `hooks/messaging/useMarkAsRead.ts` (56)                                                         | RQ `useMutation` with 10s ack timeout, partial-key `setQueriesData(['chat-summary'], applyMarkReadToSummary)` on success; NO `invalidateQueries` (Scylla EC fix)                                                                                         |
| `hooks/messaging/useMarkAsReadOnFocus.ts` (62)                                                  | Debounced 500ms mark-read on mount + on `document.visibilitychange` / `window.focus`; friendId-gated                                                                                                                                                     |
| `hooks/messaging/useSendMessage.ts` (119)                                                       | RQ `useMutation` with optimistic `local-{uuid}` insert (carries `senderAvatar` from the new `currentUserAvatar` opt), ack swap, 10s timeout; `onError` marks the optimistic message with `failed: true` (no toast) and `MessageBubble` renders a red `AlertCircle` + "Couldn't send" indicator under the failed bubble |
| `hooks/messaging/useUnreadDot.ts` (12)                                                          | Role-agnostic `(summaries ?? []).some(s => s.hasUnread)`; replaces `useUnreadMessagesDot`                                                                                                                                                                |
| `lib/query/cacheUpdaters.ts` (95)                                                               | Pure: `applyNewMessageToSummary` (DESC re-sort), `applyMessageReadToSummary` (WS-side), `applyNewMessageToHistory` (real + 5s localId de-dup; on the local-entry-replacement branch, spreads the local entry's fields into the replacement so `senderAvatar` survives the WS echo), `applyMarkReadToSummary`      |
| `lib/query/queryClient.ts` (19)                                                                 | Module-scoped singleton `QueryClient` (staleTime 30s, gcTime 5min, retry 1, refetchOnReconnect true, mutations retry 0)                                                                                                                                  |
| `api-client/messages/types.ts` (55)                                                             | API + WS types (`ChatSummary`, `ChatMessage`, `SocketChatMessage`/`NewMessageEvent`, `SendMessageRequest`, `SendMessageAck`, `MarkReadAck`, `MessageReadEvent`)                                                                                          |
| `api-client/messages/public.ts` (73)                                                            | Axios REST client                                                                                                                                                                                                                                        |
| `api-client/messages/index.ts` (19)                                                             | Barrel re-export of types + REST functions                                                                                                                                                                                                               |

### Frontend — mobile (`apps/mobile/src/`)

| File                                                                                                                                                                      | Role                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/_layout.tsx`                                                                                                                                                         | Root layout; mounts `<SocketProvider>` inside `<QueryClientProvider>` (shared `queryClient` from `lib/query-client.ts`); `<Toast />` at top offset 60                                                                                                                                                                                                                              |
| `app/pages/employer/messages/index.tsx`                                                                                                                                   | Conversation list screen; `useChatSummary`; tap → `router.push` to chat detail                                                                                                                                                                                                                                                                                                     |
| `app/pages/employer/messages/[chatId].tsx`                                                                                                                                | Chat detail (header, `FlatList` of `MessageBubble`s sorted ASCENDING, `useEffect` `scrollToEnd` on `[messages.length]`, `MessageInput`); wires `useChatSummary`, `useChatHistory`, `useSendMessage`, `useMarkAsReadOnFocus`, `useEnsureSummaryLoaded`. The `FlatList` is **not inverted** — it renders in order and `scrollToEnd`s to the bottom. Does **not** import `useSocket`. |
| `app/pages/employer/messages/components/MessageListItem.tsx`                                                                                                              | Conversation row; `isUnread` prop, blue dot (testID `unread-dot`)                                                                                                                                                                                                                                                                                                                  |
| `app/pages/employer/messages/components/{MessagesSearchBar,MessagesLoading,MessagesError,ChatHeader,MessageBubble,MessageInput,ChatEmptyState,ChatLoading,ChatError}.tsx` | All chat screen supporting components (also imported by the candidate pages via `../../employer/messages/components/…`)                                                                                                                                                                                                                                                            |
| `app/pages/employer/messages/utils.ts`                                                                                                                                    | `mapChatSummaryToConversation`, `formatTimestamp`, `filterBySearch`, `withDateSeparators`, `mapChatHistoryToMessage`, `Message` UI type (reused by candidate pages)                                                                                                                                                                                                                |
| `app/pages/employer/messages/types.ts`                                                                                                                                    | UI `Conversation` type (reused by candidate pages)                                                                                                                                                                                                                                                                                                                                 |
| `app/pages/employer/dashboard/index.tsx`                                                                                                                                  | Migrated from `useGetChatSummary` to `useChatSummary` (React Query)                                                                                                                                                                                                                                                                                                                |
| `app/pages/employer/dashboard/components/EmployerDashboardSidebar.tsx`                                                                                                    | Wires `useUnreadDot(employerProfile?.id)`; renders small blue dot (testID `sidebar-unread-dot`) on the Messages nav item; replaced hardcoded `badge: 1`                                                                                                                                                                                                                            |
| `app/pages/candidate/messages/index.tsx`                                                                                                                                  | Candidate list page (mirrors employer); uses `useGetCandidateProfile` instead of `useGetEmployerProfile`; same hooks and components                                                                                                                                                                                                                                                |
| `app/pages/candidate/messages/[chatId].tsx`                                                                                                                               | Candidate chat detail (mirrors employer); only the profile hook and component-import paths differ                                                                                                                                                                                                                                                                                  |
| `app/pages/candidate/dashboard/components/CandidateDashboardSidebar.tsx`                                                                                                  | Wires `useUnreadDot(candidateProfile?.id)`; renders small blue dot (testID `sidebar-unread-dot`) on the Messages nav item; no hardcoded badge (replaces the static `badge: 1` block with a true unread indicator driven by React Query)                                                                                                                                            |
| `lib/query-client.ts`                                                                                                                                                     | Shared `QueryClient` with mobile-aware defaults: `staleTime: 30s`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`, mutations `retry: 0`                                                                                                                                                                                                     |
| `lib/utils.ts`                                                                                                                                                            | `uuid()` helper (RFC4122 v4 via `crypto.getRandomValues`)                                                                                                                                                                                                                                                                                                                          |
| `hooks/useMessagesSocket.ts`                                                                                                                                              | Module-level singleton; RN config (strips `/api` from `API_BASE_URL`, forces `transports: ['websocket']`, function-form `auth`); typed `emitSendMessage` / `emitMarkRead`; one-line `[ws]` breadcrumb logs; `_resetSocketForTests`                                                                                                                                                 |
| `contexts/SocketProvider.tsx`                                                                                                                                             | `useSocket()` / `useSocket` context; `Set<cb>` registry; `AppState` listener invalidates `['chat-summary']` on `active` (no `socket.connected` guard — see §11); handles both `new_message` and `message_read` (self-updating via `applyMessageReadToSummary`)                                                                                                                     |
| `contexts/cacheUpdaters.ts`                                                                                                                                               | Pure functions: `applyNewMessageToSummary` (returns `undefined`, not `[]`, when cache is empty), `applyMessageReadToSummary` (WS-side), `applyNewMessageToHistory` (de-dup by real `messageId` + 5s `localId` window), `applyMarkReadToSummary` (mutation-side mirror)                                                                                                             |
| `hooks/messaging/useChatSummary.ts`                                                                                                                                       | React Query wrapper: `useQuery({queryKey: ['chat-summary', userId], enabled: !!userId, staleTime: 30_000})`                                                                                                                                                                                                                                                                        |
| `hooks/messaging/useChatHistory.ts`                                                                                                                                       | React Query `useInfiniteQuery` (cursor pagination stubbed)                                                                                                                                                                                                                                                                                                                         |
| `hooks/messaging/useSendMessage.ts`                                                                                                                                       | React Query `useMutation` with optimistic insert (`local-{uuid}`), 10-second timeout, ack swap, rollback + toast on error                                                                                                                                                                                                                                                          |
| `hooks/messaging/useMarkAsRead.ts`                                                                                                                                        | React Query `useMutation` wrapping `emitMarkRead`; 10-second ack safety timeout (`mark_read_timeout`); `onSuccess` uses **partial-key `setQueriesData`** with `applyMarkReadToSummary` and does **NOT** call `invalidateQueries` (would race Scylla's eventual consistency and clobber the optimistic write)                                                                       |
| `hooks/messaging/useMarkAsReadOnFocus.ts`                                                                                                                                 | Debounced (500ms) mark-read on mount + on `AppState→active`; **gated on `friendId`** to avoid emitting `mark_read` with an empty recipient on a cold mount (would write a `last_seen` row for `chatId = sort([userId, '']).join(':')`)                                                                                                                                             |
| `hooks/messaging/useUnreadDot.ts`                                                                                                                                         | Role-agnostic: takes `userId?: string`; returns `(summaries ?? []).some(s => s.hasUnread)` from `useChatSummary(userId)`. Both `EmployerDashboardSidebar` and `CandidateDashboardSidebar` pass their respective profile id.                                                                                                                                                        |
| `hooks/messaging/useEnsureSummaryLoaded.ts`                                                                                                                               | Refetches `['chat-summary', userId]` once if the chatId isn't in the cache (cold-cache deeplink)                                                                                                                                                                                                                                                                                   |
| `hooks/messaging/useInitConversation.ts`                                                                                                                                  | React Query `useMutation` for `POST /chats/init/:friendId`; on success invalidates `chat-summary` and `router.push` to chat detail                                                                                                                                                                                                                                                 |
| `hooks/messaging/useMessageCandidate.ts`                                                                                                                                  | Thin wrapper over `useInitConversation` with `{employerId, candidateId}`. **No live callers** — see the legacy hook below.                                                                                                                                                                                                                                                         |
| `hooks/useMessageCandidate.ts`                                                                                                                                            | **Legacy** `useState`-based conversation initiator (2 live callers in the employer applications pages). Navigates to the messages list page with `?candidateId=` (which the list page never reads). This is the path actually used at runtime.                                                                                                                                     |
| `hooks/useGetChatSummary.ts`                                                                                                                                              | **DELETED** (replaced by `hooks/messaging/useChatSummary.ts`; the dashboard now uses `useChatSummary` too)                                                                                                                                                                                                                                                                         |
| `api/messages.ts`                                                                                                                                                         | REST: `getChatSummary` / `getChatHistory` / `initConversation`                                                                                                                                                                                                                                                                                                                     |
| `types/message.ts`                                                                                                                                                        | Full shared types (REST `ChatSummary` / `ChatMessage` / `ChatHistoryResponse` + WS `NewMessageEvent` / `MessageReadEvent` / `SendMessageRequest` / `SendMessageAck` / `MarkReadAck`)                                                                                                                                                                                               |

---

## 10. Mobile — Deferred Work

- **Push notifications** when the app is backgrounded — requires `expo-notifications` + APNs/FCM credentials.
- **Offline message queue** — failed sends surface a "tap to retry" toast; message text isn't preserved for retry.
- **Typing indicators** — backend has no `typing` event.
- **Read receipts in chat UI** ("Seen 2m ago") — backend emits `message_read` to the sender, but no UI renders it.
- **Attachments / images / voice** — web has none, mobile gets the same.
- **Server-side message search** — web has client-side filter only.
- **Mobile conversation initiation** — no "Message Employer" button on the candidate side yet. The React-Query `useInitConversation` / `useMessageCandidate` in `apps/mobile/src/hooks/messaging/` are wired but have **zero callers**; the **live** employer-side "Message candidate" flow uses the legacy `apps/mobile/src/hooks/useMessageCandidate.ts` (a `useState`-based hook in the top-level `hooks/` directory, not the messaging subfolder), which navigates to the messages **list** page with a `?candidateId=` query param — a param the employer messages list page never reads (the list page's `tap` handler is driven by the `chatId` from the React Query summary, not the URL). See §11.
- **Notifications socket on mobile** — no topbar bell yet; the architecture (one shared socket) is ready for it.
- **WS reconnection backfill for missed messages** — invalidates `['chat-summary']` on `AppState→active` is a partial fix; a "since-disconnect cursor" fetch would need backend support.
- **Multi-device session management** — sender-self-echo de-dup is built in; no "this conversation is open on N devices" UI.
- **Group chat / multiple participants** — backend model is 1:1 (`Conversation` keyed on a single `participantId`).
- **Message editing / deletion** — backend has no endpoints.

---

## 11. Known Issues, Gaps & Smells

Tracked for future work — not blockers.

### Web

- **Two near-duplicate message pages.** `features/candidate/messages/page.tsx` (154 lines) and `features/employer/messages/page.tsx` (148 lines) are still ~90% identical and the candidate page still imports `ConversationSidebar`, `ChatWindow`, `types`, `utils` from `features/employer/messages/…` (architectural smell — feature code living under `employer/` but consumed by `candidate/`). A single `features/messages/` would replace both.
- **Duplicate `mark_read` emissions on click.** `ConversationSidebar.handleSelectConversation` calls `onMarkAsRead()` (page wires it to `() => markAsRead.mutate()`, page.tsx:98,125). The page also calls `useMarkAsReadOnFocus({chatId, friendId, userId})` (page.tsx:65) which fires `markAsRead.mutate()` on mount + on `document.visibilitychange` → visible / `window.focus`. So clicking a conversation fires `mark_read` twice — once immediately from the sidebar, once from the focus hook's mount effect (debounced 500ms later). Idempotent on the server (`INSERT … now()`) but wasteful, and the two are coupled by convention, not contract.
- **Dead `markChatRead` REST function.** The `markChatRead` REST function is still exported from `api-client/messages/public.ts:50-59` and `api-client/messages/index.ts:17` but has **zero call sites** in the web. Mark-as-read only happens via the WS `mark_read` event through `useMarkAsRead` / `useMarkAsReadOnFocus`. No offline fallback if the socket is disconnected. The dedicated `useMarkChatRead` hook is gone (the `api-hook/messages/` directory was deleted; this function would be the natural REST fallback).
- **Two Socket.IO connections, one provider.** `useMessagesSocket.getOrCreateSocket()` opens the messages socket at `useMessagesSocket.ts:18-26`; `useNotificationsSocket` opens the notifications socket at `useNotificationsSocket.ts:47-52`. Both are owned by `SocketProvider` (`socket-provider.tsx:56, 126`). They could be unified into a single `io()` that listens to both event namespaces. No functional reason to keep them separate. (The `useAiSocket` rides the messages socket.)
- **Notification hook has no reconnection cap.** `useNotificationsSocket.ts:47-52` config has `reconnection: true` but no `reconnectionAttempts`, `reconnectionDelay`, or `reconnectionDelayMax`. The default backoff hammers the server forever on failure. `useMessagesSocket` caps at 10 attempts.
- **`SocketProvider` notifications effect deps are unstable.** The effect at `socket-provider.tsx:127` has `[notificationSocketReturn]` as its dep. `useNotificationsSocket()` returns a fresh object identity each render (new `useCallback` for `onNewNotification`), so the effect re-registers a fresh fan-out closure on every SocketProvider render. Wasteful but functionally correct. (The messages-side fan-out is now stable — `useMessagesSocket` is `useMemo(() => getOrCreateSocket(), [])`.)
- **9 unguarded `console.log` calls in `useMessagesSocket.ts`.** Lines 17, 27, 28, 30, 32, 34, 37, 39, 59 in `getOrCreateSocket()` and `emitMarkRead` are NOT gated by `__DEV__` or `DEBUG`. Worse than the previous `const DEBUG = true;` state. Ship to production.
- **2 unguarded `console.log` calls in `useAiSocket.ts`.** Lines 24, 57 are NOT gated.
- **6 unguarded `console.error` in the candidate init flow.** `useMessageCandidate.ts:18,33` and the candidate applications / dashboard page init flows (`features/candidate/applications/page.tsx:36`, `features/candidate/dashboard/page.tsx:37`, plus `useInitializeConversation.ts` callers). None gated.
- **4 unguarded `console.error` in `useNotifications.ts`.** Lines 70, 127, 137, 147 — none gated.
- **No session refresh on reconnect.** If the `better-auth.session_token` cookie expires while the tab is backgrounded, the WS fails to re-auth silently. (Mobile partially addressed: backend now also reads `handshake.auth.cookie` — the RN client sends the cookie from SecureStore on every reconnect. Web has no equivalent.)

### Web — recently resolved

Documented so a future reader doesn't re-discover them and so the rationale for the code changes survives.

- **No React Query for messages (FIXED).** Project now uses `@tanstack/react-query` for the entire messaging stack: `useChatSummary`, `useChatHistory` (infinite), `useMarkAsRead`, `useMarkAsReadOnFocus`, `useSendMessage`, `useUnreadDot`, `useEnsureSummaryLoaded`, `useInitializeConversation` in `apps/web/src/hooks/messaging/` (8 files, ~400 lines). Plus `apps/web/src/lib/query/{cacheUpdaters,queryClient}.ts`. The `['chat-summary', userId]` cache is the single bus; the `['chat-history', chatId]` cache holds message history. Pages and the dashboard read from the same cache; `SocketProvider` writes to it. Caching, dedup, retries, background refetch, and infinite-query plumbing are all in place. (Mirrors the mobile's React Query bus — see §5b, §8d.)
- **Two sources of truth for `any unread?` (FIXED).** The in-page list (`features/employer/messages/page.tsx:22` via `useChatSummary`) and the global sidebar dot (`useUnreadDot` reading from the same `useChatSummary`) now read from the same `['chat-summary', userId]` cache. The employer dashboard also reads from the same cache (`features/employer/dashboard/page.tsx:54-60`). The cache bus always sets `hasUnread: true` on the matching conversation via `applyNewMessageToSummary` (`lib/query/cacheUpdaters.ts:13-28`); the `markAsRead.mutate()` path sets `hasUnread: false` for the matching chatId via `applyMarkReadToSummary` (lines 38-44). The `briefly disagree` asymmetry is gone.
- **Optimistic sent messages not reconciled (FIXED — port of mobile pattern).** `useSendMessage.onMutate` inserts with `messageId: \`local-${crypto.randomUUID()}\``; `onSuccess`swaps to the real`ack.messageId`(lines 78-89). The cache layer's`applyNewMessageToHistory`does two de-dup guards (real`messageId`+ 5-second`localId`window —`lib/query/cacheUpdaters.ts:48-83`) that catch the WS echo and remove the `local-\*`row. (Web`onError`no longer rolls back — it marks the message with`failed: true` instead; see the "Failed-send indicator" FIXED entry below.)
- **Failed-send indicator (FIXED — web only).** The web `useSendMessage.onError` (lines 95-115) no longer rolls back the optimistic message and no longer shows a misleading `toast.error("Couldn't send — Tap to retry")` (whose `onPress` was a no-op stub). It now marks the optimistic message in `pages[0]` with `failed: true` and clears `localIdRef`. `MessageBubble` (`features/employer/messages/MessageBubble.tsx:50-55`) reads the flag and renders a red `AlertCircle` + "Couldn't send" line below the bubble's timestamp. The 10s emitter timeout and the ack-error path both flow through this same handler, so the same indicator shows regardless of failure mode. The user retypes and resends manually; on reload the `local-*` message disappears because the server never knew about it. `ChatMessage` (`api-client/messages/types.ts`) and `Message` (`features/employer/messages/types.ts`) both gained `failed?: boolean`; `withDateSeparators` (`utils.ts`) passes it through with default `false` so server-originated messages render unchanged. Mobile still has the old toast — see §11 mobile.
- **Just-sent bubble showed the `placehold.co/40x40` avatar fallback (FIXED — web only).** Before the fix, sending a message rendered the bubble with the hardcoded `https://placehold.co/40x40` placeholder on the right side; the real avatar only appeared after a page reload. Two cooperating root causes: (1) `useSendMessage.onMutate` built the optimistic `ChatMessage` without `senderAvatar` (and the better-auth session in `useUser()` doesn't expose the avatar for this user — the avatar lives in the profile, fetched via `useGetEmployerProfile` / `useGetCandidateProfile`); (2) the WS `new_message` echo (emitted by the backend to both recipient and sender rooms for multi-device sync — `messages.gateway.ts:265-267`) flows into the cache via `applyNewMessageToHistory`, which built a replacement entry from `{ messageId, senderId, content, timestamp }` only — no `senderAvatar` — so even if the optimistic entry had carried the avatar, the WS echo would have replaced it with a placeholder-bound row. Fix: (a) `useSendMessage.Opts` gained `currentUserAvatar?: string | null` (lines 11-16) and `onMutate` writes `senderAvatar: opts.currentUserAvatar ?? null` on the optimistic literal (line 68); (b) `ChatWindow` accepts and forwards `currentUserAvatar` (props line 17, destructure line 25, `useSendMessage` call line 40); (c) the messages pages source `currentUserAvatar` from the profile context (employer: `useGetEmployerProfile().data?.avatarUrl`, candidate: `useGetCandidateProfile().data?.avatarUrl`) — the sidebar already uses the same source for its footer avatar (`employerSidebar.tsx:348`); (d) `applyNewMessageToHistory` now spreads the local entry's fields into the replacement (`{ ...first[localIdx], messageId, senderId, content, timestamp }`, `cacheUpdaters.ts:77-83`) so `senderAvatar` (and any other client-only fields like `failed`) survive the WS-echo swap. Cross-device (the sender's other devices receiving `new_message` for a message they didn't send locally) is NOT fixed by this change — the local entry doesn't exist on the other device, so the `localIdx >= 0` branch isn't taken and the `else` branch still builds a placeholder-bound entry. Same wire-format gap as the spec's "Out of scope" section; a server-side fix (add `senderAvatar` to the `new_message` payload) is the proper resolution.
- **Sender-self-echo duplication (FIXED).** Previously filtered at the top of the page's `onNewMessage` handler. Now filtered at the cache layer inside `applyNewMessageToHistory`: real `messageId` de-dup (catches sender-self-echo from multi-device, reconnect storms, optimistic-send-swap races) then 5-second `localId` de-dup (matches on `senderId` + `content` + close timestamp). The `localId` matches the `local-{uuid}` from `useSendMessage.onMutate`. The handler is gone from the page.
- **Employer page ignores `?candidateId=` (FIXED).** `apps/web/src/features/employer/messages/page.tsx:19-20, 49-58` now reads `searchParams.get('candidateId')` and auto-selects the matching conversation. The candidate page does the same for `?recruiterId=`. Both pages are consistent.
- **Two parallel `init conversation` hooks (FIXED).** `apps/web/src/api-hook/messages/useInitConversation.ts` is GONE (the entire `api-hook/messages/` directory was deleted). The single `useInitializeConversation.ts` now lives at `apps/web/src/hooks/messaging/useInitializeConversation.ts` and has 3 callers (was 1): `useMessageCandidate` + 2 new candidate pages (`features/candidate/applications/page.tsx:34`, `features/candidate/dashboard/page.tsx:35`).
- **Eventual-consistency clobber on mark-read (FIXED).** `useMarkAsRead.onSuccess` (lines 41-49) does NOT call `invalidateQueries` — would race Scylla's eventual consistency and clobber the optimistic write. Comment cites `messaging-architecture.md §4 'markAsRead' caveat`. The natural `staleTime: 30_000`, the `document.visibilitychange`/`window.focus` invalidation, and subsequent WS `new_message` events reconcile once Scylla settles.
- **`useMarkAsRead` key-shape mismatch (FIXED).** Uses `setQueriesData({queryKey: ['chat-summary']}, …)` (partial-key match), which updates every `chat-summary` entry regardless of the userId suffix the subscriber used. Mirrors mobile's fix.
- **FriendId-gate fix on `useMarkAsReadOnFocus` (FIXED — port of mobile).** Both effects early-return when `opts.friendId` is empty (`useMarkAsReadOnFocus.ts:39, 51`). Avoids emitting `mark_read` with an empty recipient on a cold mount (which would write a `last_seen` row for `chatId = sort([userId, '']).join(':')` — a bogus chat). Mirrors mobile's `useMarkAsReadOnFocus fired with empty friendId (FIXED)` entry.
- **10-second ack safety timeout on send / mark-read (FIXED).** `emitSendMessage` and `emitMarkRead` reject with `send_timeout_emitter` / `mark_read_timeout_emitter` after 10s (`useMessagesSocket.ts:46-49, 61-64`). Without it, a dead socket would leave the mutation hanging forever. The web `useSendMessage.onError` catches the timeout and marks the message with `failed: true` (renders the red "Couldn't send" indicator — see the "Failed-send indicator" FIXED entry); the mobile `useSendMessage.onError` catches it and shows the legacy toast. Mirrors mobile's `10-second ack safety timeout` fix.
- **`useUnreadDot` made role-agnostic (FIXED — port of mobile).** The hook takes a `userId?: string` parameter and reads `useChatSummary(userId)` (`useUnreadDot.ts:5-12`). Both `EmployerSidebar` and `CandidateSidebar` pass their `currentUser?.id`. Single source of truth for the unread-dot selector across roles. Was a precondition for the candidate-side sidebar dot.
- **No reconnection backfill (PARTIALLY FIXED).** `SocketProvider` invalidates `['chat-summary']` on `document.visibilitychange` → visible and on `window.focus` (`socket-provider.tsx:111-123`). The shared `queryClient` has `staleTime: 30_000` and `refetchOnReconnect: true` (`lib/query/queryClient.ts:9-14`), so a real reconnect re-fetches the summary via React Query. No explicit socket-reconnect listener. Mobile: same partial fix via `AppState→active` invalidation.
- **Debug logging on in production (MIS-DESCRIBED → STILL OPEN, modified).** The original claim was that both `useMessagesSocket.ts:10` and `useNotificationsSocket.ts:9` hard-code `const DEBUG = true;`. That was true once but is no longer: `useMessagesSocket.ts` has been refactored to 9 UNGATED `console.log` calls (lines 17, 27, 28, 30, 32, 34, 37, 39, 59). `useNotificationsSocket.ts:9` still has `const DEBUG = true;` gating its `logDebug` calls. `useAiSocket.ts` has 2 ungated `console.log` calls. Net: the messages socket is WORSE off than before (no gating at all); see the open "unguarded `console.log`" bullets above.
- **Single-callback slot in the underlying hooks (MIS-DESCRIBED → STILL OPEN, modified).** The original claim was that `useMessagesSocket.onNewMessage` uses `messageCallbackRef.current = callback`. That hook no longer exists — `useMessagesSocket` is a 3-line compat shim with no callbacks. `useNotificationsSocket` STILL has the single-callback slot via `notificationCallbackRef.current = callback` (line 79). `useAiSocket` re-registers handlers on every relevant render via `useEffect` deps (line 95) — no `useRef`. The `Set<callback>` pattern is now in `SocketProvider` for all three event types. The new state is healthier than the doc described but the notifications socket still has the same single-slot smell.
- **Candidate web messaging flow added (FIXED).** `useInitializeConversation` has 2 new candidate callers: `features/candidate/applications/page.tsx:34, 136-137` and `features/candidate/dashboard/page.tsx:35, 89-90`. Both navigate to `/candidate/messages?recruiterId=...`, which the candidate page reads. The candidate side now has a "Message recruiter" deeplink flow, mirroring the employer's `useMessageCandidate` flow.

### Backend

- **Latent `LIMIT 1` ordering bug in `messages.service.ts:146-150`.** The `SELECT message_id, sender_id FROM messages WHERE chat_id = ? LIMIT 1` query has no `ORDER BY`. ScyllaDB's clustering order is **ascending** on `message_id` (TimeUuid), so the first row returned is the **oldest** in the partition, not the latest. The subsequent comparison to `last_read` (`hasUnread = messageTimestamp > lastReadTimestamp`, line 173) can therefore evaluate against a stale message. Fix: `ORDER BY message_id DESC LIMIT 1`.
- **Inconsistent room naming.** `messages.gateway.ts:42` and `ai.gateway.ts:31` use `userId` directly as the room name; `notifications.gateway.ts:31` uses `notifications:${userId}`. Works today but blocks any future "broadcast to a user's every device" feature.
- **`getChatHistory` has no cursor pagination.** The mobile `useChatHistory` is built with `useInfiniteQuery` (for forward compatibility) but the server returns the first 50 messages on every call. Adding cursor support requires backend work.
- **`getChatHistory` has no `ORDER BY` clause.** The `SELECT * FROM messages WHERE chat_id = ? LIMIT ?` query in `messages.service.ts:232-274` returns rows in arbitrary order, so the mobile chat screen's own sent messages can render off-screen or be de-duped by `keyExtractor` collisions when combined with an inverted `FlatList`. The mobile `withDateSeparators` now sorts ASCENDING client-side, which masks the symptom. The web happens to render correctly today because of `keyExtractor` dedup luck. The right fix is `ORDER BY message_id ASC` (or `DESC`).
- **Notifications + AI gateways do not yet accept `handshake.auth.cookie`.** Only `messages.gateway.ts` was updated for RN cookie-merge in this iteration. A mobile client trying to consume notifications or AI events would fail to authenticate.

### Mobile (open)

- **"Tap to retry" toast is a no-op.** `useSendMessage.ts` shows `Toast.show({type:'error', text2:'Tap to retry', onPress: …})` on send failure, but the `onPress` body is an empty stub (line ~110 — the file has a comment "the user can re-tap the Send button themselves; this is a UX nicety"). `lastTextRef` is captured but never read by any retry handler. The "Tap to retry" string is misleading — tapping the toast does nothing, and the user has to retype the message in the input. A real retry handler would `send.mutate(lastTextRef.current)`.
- **Two `useMessageCandidate` implementations; React-Query version is dead code.** `apps/mobile/src/hooks/useMessageCandidate.ts` (legacy, `useState`, 2 live callers in the employer applications pages) is the one actually used at runtime. `apps/mobile/src/hooks/messaging/useMessageCandidate.ts` (React-Query wrapper, 0 callers) is the one this doc describes. They diverge: legacy navigates to the messages **list** with `?candidateId=`; the React-Query wrapper navigates to chat detail with `chatId`. The employer's messages list page never reads `?candidateId=`, so the legacy flow is effectively a list-page deeplink with a dead query param.
- **`useMarkAsReadOnFocus` AppState effect has stale-closure risk on `chatId`.** `useMarkAsReadOnFocus.ts:40-49` — the AppState effect's dep array is `[opts.friendId]` only (eslint-disabled). The handler reads `opts.chatId` at log/fire time. If `chatId` flips while `friendId` stays stable (rare in 1:1 chat, but possible if `participantId` collides across summaries), the handler logs and would mutate on the stale `chatId`. The mount-time effect mostly covers this by re-binding everything when `chatId` changes, but the AppState handler closure is not symmetric. Fix: include `opts.chatId` in the AppState effect's deps, or read it from a ref.
- **Hard-coded employer route in `useInitConversation`.** `useInitConversation.ts:19` — `pathname: '/pages/employer/messages/[chatId]'` regardless of caller. A candidate caller would land on the employer's chat screen. The hook has no live callers, so the bug is dormant, but the API needs an explicit role/route parameter before any candidate-side entry point is wired.
- **`?candidateId=` / `?recruiterId=` deeplinks never auto-open a chat.** The legacy `useMessageCandidate` pushes to `/pages/employer/messages?candidateId=…`, but the list page's `tap` handler is driven by the React Query `chatId` from the summary cache, not by `searchParams`. No equivalent `?recruiterId=` exists on the candidate side either. (Web has the same smell on the employer side — see the "Employer page ignores `?candidateId=`" issue above.)
- **Excessive unguarded `console.log` noise in the messaging path.** 20 unguarded log calls in production code: 9 `[ws]` in `useMessagesSocket.ts`, 2 `[ws] subscriber error` `console.error`s + 1 `[ws] message_read` in `SocketProvider.tsx`, 4 `[mark-read]` in `useMarkAsRead.ts`, 4 `[mark-read]` in `useMarkAsReadOnFocus.ts`, 1 `console.warn` in the legacy `useMessageCandidate.ts`. None gated by `__DEV__`. Acceptable as cheap breadcrumbs, but if production noise is a concern, gate them with `if (__DEV__)`.
- **No cursor pagination in `useChatHistory`.** Server returns the first 50 messages; older history is not loadable. `getNextPageParam` is stubbed to return `undefined`.
- **No offline send queue.** If the socket is disconnected and the user sends a message, the optimistic insert is shown for up to 10 seconds, then rolled back with a "Couldn't send — tap to retry" toast. Message text isn't preserved for retry (and even if it were, the toast's `onPress` doesn't read it — see the toast bug above).
- **No reconnection backfill.** If the socket disconnects mid-session, no `GET /chats/summary?since=<ts>` endpoint exists to fetch missed messages. The `AppState→active` listener only invalidates React Query, which refetches the entire summary.
- **Notifications socket not wired.** The mobile topbar has no notification bell yet, and `useNotificationsSocket` does not exist. The architecture (one shared socket) is ready for it; just needs the hook + bell.
- **Sender-self-echo in chat-history is correct, but optimistic `unread: !isActiveChat` is server-blind.** When the chat screen is open and a new message arrives, the list page's matching row gets `hasUnread: false` set optimistically. The server would still say `true` until the next `fetchChatSummary`. In practice the chat screen calls `mark_read` immediately, so this is invisible — but the invariant isn't enforced. Same risk as the web's `useUnreadMessagesDot`.
- **Hardcoded socket config in `useMessagesSocket.ts`.** `reconnectionDelay: 1000`, `reconnectionDelayMax: 5000`, `reconnectionAttempts: 10` are inline constants. A future caller needing different behavior will need to refactor the singleton.
- **`useEnsureSummaryLoaded` only refetches when a cache exists but doesn't contain the chatId.** If the user lands on chat detail with a _cold_ `['chat-summary', userId]` cache (no prior fetch), the hook is a no-op. The chat screen then renders with `summary === undefined` until the next general invalidation fires. Edge case; rare in practice.
- **Why `useGetEmployerProfile` / `useGetCandidateProfile` instead of `useUser` (unchanged):** the mobile `useUser()` calls `authClient.useSession()` from Better Auth, which reads an in-memory cache populated only by `getSession()`. `SessionResumeGate` in `app/_layout.tsx` calls `getSession()` only on public routes, so `useSession()` returns `{data: null}` on protected pages. `useGetEmployerProfile` and `useGetCandidateProfile` are TanStack Query hooks backed by real HTTP calls; the axios interceptor sends the `Cookie` header on every request, so the backend validates the session regardless of whether Better Auth's in-memory cache is hydrated.

### Mobile — recently resolved

No longer issues. Documented so a future reader doesn't re-discover them and so the rationale for the code changes survives.

- **WS `connect_error: "Invalid namespace"` (FIXED).** `API_BASE_URL` is `http://10.0.2.2:3000/api` (Android) / `http://localhost:3000/api` (iOS) — correct for REST (backend mounts endpoints under `/api`), but socket.io treats everything after the host as a namespace, so passing the full URL made the client try to connect to namespace `/api`, which the gateway never registered. The fix in `useMessagesSocket.ts` derives `wsBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '')` and connects to that. REST still uses the original `API_BASE_URL` (with `/api`), so endpoints are unaffected. This was the actual root cause of the "mark-read does nothing" symptom — the socket never connected, so no `mark_read` emit ever reached the backend, so no `message_read` WS echo ever came back, and no `hasUnread` ever flipped.
- **Stale auth cookie frozen at socket-creation (FIXED).** `authClient.getCookie()` returns `""` at module-init time (the session is hydrated into SecureStore asynchronously). The static `auth: { cookie: authClient.getCookie() ?? '' }` form froze that empty cookie for the entire lifetime of the socket. The fix uses the **function form** `auth: (cb) => cb({ cookie: authClient.getCookie() ?? '' })`, which socket.io-client calls on every connect / reconnect attempt, so the cookie is always fresh. This was a latent bug that would have manifested the moment the `/api` namespace fix above let the socket actually reach the auth check.
- **`message_read` WS event was a no-op (FIXED).** The previous `onMessageRead` handler only fanned out to `messageReadListeners` (none registered anywhere) and had a comment saying "listeners (useUnreadDot) are responsible for invalidating themselves". That was wishful — `useUnreadDot` never registered a listener, so the partner marking a chat as read on their own device never updated the receiver's cache. The fix: the handler now self-updates every `['chat-summary', *]` cache entry via `setQueriesData({queryKey: ['chat-summary']}, (old) => applyMessageReadToSummary(old, readBy))`, matching on `participantId` (the OTHER party, from the event's `friendId` / `by` field). Closes the "partner reads on their device" gap.
- **`useMarkAsRead` key-shape mismatch (FIXED).** The mutation's `onSuccess` used `setQueryData(['chat-summary', opts.userId], …)` with a specific key. When the call site `useMarkAsReadOnFocus({…, userId: profile?.id ?? ''})` was called with an empty `userId` (cold mount), the optimistic write went to `['chat-summary', '']` — a key no subscriber was on. The fix: use `setQueriesData({queryKey: ['chat-summary']}, …)` (partial-key match), which updates every `chat-summary` entry regardless of the suffix the subscriber used (`''`, `undefined`, or the real id).
- **Eventual-consistency clobber on mark-read (FIXED).** The original `onSuccess` called `invalidateQueries({queryKey: ['chat-summary']})` to "reconcile with the server". In practice the refetch raced ScyllaDB's eventual consistency: the just-written `last_seen` row might not be visible to the very next read, so the refetch observed the stale "no `last_seen`" state and overwrote the optimistic `hasUnread: false` with `hasUnread: true`. The fix: drop the `invalidateQueries` and let the natural `staleTime` (30 s), `AppState→active` invalidation, and subsequent WS events reconcile once Scylla settles.
- **`useMarkAsReadOnFocus` fired with empty `friendId` (FIXED).** On a cold mount where the chat summary hadn't resolved yet, `summary?.participantId ?? ''` was `''`, and the effect emitted `mark_read` with an empty recipient. The backend would then write a `last_seen` row for `chatId = sort([userId, '']).join(':')` — a bogus chat. The WS echo would carry `friendId: ''` back, never matching any real conversation in the summary cache. The fix: both effects early-return when `opts.friendId` is empty, and the AppState handler's deps now include `opts.friendId` so the listener re-registers once the summary resolves.
- **10-second ack safety timeout.** `useMarkAsRead.mutationFn` wraps the `emitMarkRead` ack in a `setTimeout(10_000)` that rejects with `mark_read_timeout`. Without it, a dead socket would leave the mutation hanging forever with no `onError` ever firing. With it, the failure surfaces in one place and any caller-side error handling can react.
- **`bg-app-primary` Tailwind class was undefined (FIXED — separate from the cache layer).** The sidebar's `sidebar-unread-dot` used `className="… bg-app-primary"`, but `tailwind.config.js` defines `app-primary-1`, `app-primary-2`, etc. — not `app-primary` (no suffix). The class was purged, the `<View>` rendered as a 10×10 transparent circle, and the dot was invisible. Fixed in `EmployerDashboardSidebar.tsx:236`, `ChatError.tsx:23`, and `MessagesError.tsx:21` (replaced with `bg-app-primary-1`). The messages list row's `unread-dot` was already using the valid `bg-blue-500`, which is why the list row showed the dot while the sidebar didn't.
- **Why no `&& socket.connected` guard on `AppState→active` invalidation (FIXED — explained).** The original code only invalidated `['chat-summary']` if the socket was connected. The intent was to avoid refetching when the socket was in a failed state, but the effect was that a permanently broken socket could never trigger a foreground refresh — the user would have to kill and reopen the app. The fix drops the guard; the REST endpoint is independent of the socket, so the refetch is always safe.
- **`useUnreadDot` made role-agnostic.** The hook previously hardcoded `useGetEmployerProfile` to derive its own `userId`, which would have crashed any non-employer caller. The fix: take a `userId?: string` parameter and read `useChatSummary(userId)`. `EmployerDashboardSidebar` passes `employerProfile?.id`; `CandidateDashboardSidebar` passes `candidateProfile?.id`. Single source of truth for the unread-dot selector across roles. The change was a precondition for the candidate mobile messaging pages — without it, the candidate sidebar's dot would have needed a parallel hook, which would have drifted from the employer's logic on any future fix.
- **Candidate mobile messaging added.** `/candidate/messages` and `/candidate/messages/[chatId]` mirror the employer pages component-for-component, importing everything from `pages/employer/messages/components/…`. The `CandidateDashboardSidebar` replaces its hardcoded `badge: 1` with a real blue dot driven by `useUnreadDot(candidateProfile?.id)`. The candidate pages have no conversation-initiation entry point yet (no "Message Employer" button on the candidate side); see §10.
