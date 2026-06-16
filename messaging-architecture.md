# Messaging System Architecture

Hybrid REST + WebSocket (Socket.IO) real-time chat with dual-database persistence. Conversation metadata lives in **PostgreSQL** (via Prisma); messages live in **ScyllaDB** (Cassandra-compatible) for high-write throughput and time-series querying.

Three clients share the same backend:

- **Web** (`apps/web`, Next.js) — two parallel Socket.IO connections wrapped in a single `SocketProvider`; raw `useState` + `axios`; no React Query for messages.
- **Mobile** (`apps/mobile`, Expo / React Native) — **single persistent Socket.IO connection** managed by a `SocketProvider`; **React Query** as the cache and bus for `chat-summary` and `chat-history`; optimistic send with `local-{uuid}` → real `messageId` swap on ack; RN-specific WS config (forced `websocket` transport, `auth.cookie` for the WS upgrade, `/api` strip, function-form `auth`).
- **Backend** (`apps/backend`, NestJS) — three Socket.IO gateways (`messages`, `notifications`, `ai`); the messages gateway emits `new_message` to BOTH recipient and sender rooms for multi-device sync.

Mobile brings the conversation list, chat detail, mark-as-read, real-time messaging, and unread badge to **both employer and candidate roles** (the candidate side mirrors the employer pages component-for-component — no separate component tree), and applies targeted fixes to the web's documented smells (sender-self-echo duplication, no React Query for messages, two sources of truth for unread).

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

**Web** — `apps/web/src/api-client/messages/types.ts` (API layer):

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

**Web** — `apps/web/src/features/employer/messages/types.ts` (UI layer): adds `name`/`role`/`avatar`/`unread`/`isSent`/`showDateSeparator`/`dateLabel`/`timestamp24` to `Conversation` / `Message`.

**Mobile** — `apps/mobile/src/types/message.ts` (shared REST + WS wire):

```typescript
// REST — mirrors backend ChatSummaryResponse / ChatHistoryResponse
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

`apps/web/src/api-client/messages/public.ts` (Axios, calls NestJS directly — no Next.js proxy):

```typescript
getChatSummary(userId)       → GET  /api/chats/summary?userId=
getChatHistory(friendId, 50) → GET  /api/chats/history/:friendId
markChatRead(friendId)       → POST /api/chats/read/:friendId
initConversation(friendId)   → POST /api/chats/init/:friendId
```

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

Web has **two parallel Socket.IO connections** to the same backend (same `path: /socket.io`, same base URL, both `withCredentials: true`). They are wrapped together by `SocketProvider` (§3c) but are two independent connections on the wire.

| Hook          | File                                           | Listens for                                                                                                             |
| ------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Messages      | `apps/web/src/hooks/useMessagesSocket.ts`      | `connect`, `disconnect`, `connect_error`, `new_message`, `message_read` — emits `send_message`, `mark_read`             |
| Notifications | `apps/web/src/hooks/useNotificationsSocket.ts` | `new_notification` (room `notifications:<userId>`)                                                                      |
| AI            | `apps/web/src/hooks/useAiSocket.ts`            | `RESUME_PARSED_<userId>`, `RESUME_SCORED_<userId>` (mounted globally via `<GlobalAiSocket />`, not in `SocketProvider`) |

- Messages socket: `withCredentials: true`, transports `['websocket', 'polling']`, reconnection capped at 10 attempts (1s–5s backoff). `sendMessage` / `markAsRead` silently no-op if disconnected.
- Notifications socket: `reconnection: true` with default backoff (no cap — hammers forever on failure).
- All three hooks hold a **single callback in a `useRef`** (overwrite-on-set, not a `Set`); multi-subscriber fan-out lives in `SocketProvider`.

### 3c. Socket Context Provider (web)

`apps/web/src/contexts/socket-provider.tsx` — mounted at the root via `apps/web/src/app/providers.tsx:33`. Internally calls both `useMessagesSocket()` and `useNotificationsSocket()`, so it owns two Socket.IO connections.

- `Set<callback>`-based multi-subscriber pattern for `new_message`, `message_read`, `new_notification` (the hooks only hold a single callback; the provider re-fans).
- `onNewMessage(cb)`, `onMessageRead(cb)`, `onNewNotification(cb)` return unsubscribe functions (lines 102-107).
- Exposes `socket`, `isConnected`, `activeChatId`, `setActiveChatId`, `sendMessage`, `markAsRead` via the `useSocket()` hook.
- Per-subscriber errors are silently caught (`console.error`) so one bad subscriber cannot break fan-out.
- **Auth model:** no explicit token in the WS handshake — `better-auth.session_token` HTTP-only cookie sent via `withCredentials: true`. Backend gateways call `authService.validateToken(handshake.headers)` and `client.disconnect()` on failure.

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

**Connection observability:** one-line `[ws]` breadcrumb logs on `connect`, `disconnect`, `connect_error`, `reconnect`, `reconnect_attempt`, `reconnect_error`, `reconnect_failed`, plus per-connect `auth` and per-emit `mark_read`. Intentionally cheap production breadcrumbs (not behind a debug flag) so the next "WS doesn't work" symptom is one `adb logcat | grep [ws]` away from a root cause.

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

- **`applyNewMessageToSummary(old, msg)`** — bumps `lastMessage` + `lastMessageAt`, sets `hasUnread = true` on the matching conversation, bubbles it to the top (senderId-match, stable sort). Returns `undefined` (not `[]`) when the cache is empty so a WS event arriving before the initial fetch never clobbers a not-yet-populated cache.
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

| Route                 | File                                                            | Purpose                                                                                                              |
| --------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/employer/messages`  | `apps/web/src/features/employer/messages/page.tsx` (356 lines)  | Employer messaging UI                                                                                                |
| `/candidate/messages` | `apps/web/src/features/candidate/messages/page.tsx` (401 lines) | ~90% duplicate; auto-selects on `?recruiterId=` (the employer page does **not** read `?candidateId=` — inconsistent) |

In-page components (all in `apps/web/src/features/employer/messages/`): `ConversationSidebar` (search + unread dots, emits `mark_read` on click), `ChatWindow` (history, input, send), `MessageBubble` (single message with date separators). The candidate page imports all three from the employer folder (architectural smell — see §11).

**Global navigation sidebars** (layout-level, render the blue "has unread" dot on the Messages item):

| Component          | File                                                         | Consumes                 |
| ------------------ | ------------------------------------------------------------ | ------------------------ |
| `EmployerSidebar`  | `components/employer/employerSidebar.tsx:84-89, 156-158`     | `useUnreadMessagesDot()` |
| `CandidateSidebar` | `components/candidate/candidateSidebar.tsx:158-160, 110-113` | `useUnreadMessagesDot()` |

`useUnreadMessagesDot` (`apps/web/src/hooks/useMessages.ts:20-120`) flow:

1. Mount → `fetchChatSummary(userId)` (REST) → `setHasUnreadMessages(summaries.some(s => s.hasUnread))`
2. `onNewMessage` → if `activeChatId !== message.senderId`, flip the dot to `true` immediately and refetch `getChatSummary` for re-validation
3. `onMessageRead` → refetch `getChatSummary` (re-derive from server)

The topbar **bell** with numeric `99+` badge is a separate flow: it consumes the **notifications** socket via `useNotifications()` (`apps/web/src/hooks/useNotifications.ts:80-86`) and renders in `candidateTopBar.tsx:88-92` / `employerTopBar.tsx:131-135`. Independent of the Messages sidebar dot.

**Web page flow** (`features/employer/messages/page.tsx`):

1. **Mount** → `fetchChatSummary(userId)` (REST) → transform `ChatSummary[]` → `Conversation[]` (auto-generated HH:mm `timestamp`) → auto-select first conversation → optimistically clear its `unread` flag → emit `mark_read` over WS if it was unread.
2. **Select conversation** → sidebar emits `mark_read` (lines 34-50) AND `onSelectConversation` → page sets `selectedConversation` + `setActiveChatId(participantId)` → `ChatWindow` fires `fetchChatHistory(participantId, 50)` (REST) → sort ascending, decorate with date separators → `setMessages` → auto-scroll.
3. **Send message** → `sendMessage(participantId, content)` over WS → optimistic append `Message` with `messageId: 'temp-${Date.now()}'` → optimistic sidebar row update. Server echo is **filtered** at the top of `onNewMessage` (early-return for `senderId === currentUser.id`) — no more duplicate `'socket-${Date.now()}'`. The temp id is never reconciled to a real id; it stays in the list until the user navigates away.
4. **Receive `new_message`** (page.tsx:154-222) → early-return if self-sent → otherwise:
   - This page's handler: if `activeChatIdRef.current === message.senderId`, append to the active thread and emit `mark_read` (only when `document.visibilityState === 'visible'`). In all cases, update the matching row's `lastMessage` + `timestamp` and set `unread = !isActiveChat` optimistically (WS payload has no `hasUnread` field). Stable-sort bubble the matching conversation to index 0.
   - `useUnreadMessagesDot` (global sidebars): same fan-out, different rules — flips the global dot to `true` and refetches `getChatSummary`.
5. **Receive `message_read`** → `useUnreadMessagesDot` refetches `getChatSummary`. The in-page list does not listen to `message_read`.

### 5b. Mobile

| Route                          | File                                                        | Purpose                                                                             |
| ------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `/employer/messages`           | `apps/mobile/src/app/pages/employer/messages/index.tsx`     | Conversation list with `FlatList`, search, pull-to-refresh, unread blue dot per row |
| `/employer/messages/[chatId]`  | `apps/mobile/src/app/pages/employer/messages/[chatId].tsx`  | Chat detail: header, `FlatList` of `MessageBubble`s (inverted), `MessageInput`      |
| `/candidate/messages`          | `apps/mobile/src/app/pages/candidate/messages/index.tsx`    | Candidate-side mirror of the employer list page; uses `useGetCandidateProfile`     |
| `/candidate/messages/[chatId]` | `apps/mobile/src/app/pages/candidate/messages/[chatId].tsx` | Candidate-side mirror of the employer chat detail                                   |

| Component                                                 | File                                                                   | Purpose                                                                                                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EmployerDashboardSidebar`                                | `pages/employer/dashboard/components/EmployerDashboardSidebar.tsx`     | Sidebar with blue dot on "Messages" via `useUnreadDot(employerProfile?.id)`                                                                      |
| `MessageListItem`                                         | `pages/employer/messages/components/MessageListItem.tsx`               | Row with avatar/name/timestamp/preview, unread blue dot (testID `unread-dot`)                                                                     |
| `MessagesSearchBar` / `MessagesLoading` / `MessagesError` | `…/components/`                                                        | Search, spinner, inline error with retry                                                                                                          |
| `ChatHeader` / `MessageBubble` / `MessageInput`           | `…/components/`                                                        | Back button + avatar + name + role, single message (testID `bubble-sent`/`bubble-received`), multiline input + send button (testID `send-button`) |
| `ChatEmptyState` / `ChatLoading` / `ChatError`            | `…/components/`                                                        | Empty state, spinner, chat error with Try again / Back                                                                                            |

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
5. `useMarkAsReadOnFocus` (debounced 500ms) fires `mark_read` on mount + on `AppState→active` while the screen is open
6. `useSendMessage` mutation: optimistic insert with `local-{uuid}` → emit over WS → on ack, swap `localId` → real `messageId`; on ack error or 10-second timeout, roll back + show toast
7. WS `new_message` events handled by `SocketProvider` (not by this screen): the cache is updated with de-dup, and React Query re-renders this screen automatically. Sender-self-echo is dropped at the cache layer.

---

## 6. Architecture Diagram

```
┌───────────────────────────────────────┐          ┌─────────────────────────────────────────┐
│  Web Frontend (Next.js)               │          │  Backend (NestJS)                       │
│                                       │          │                                         │
│  Providers (app/providers.tsx)        │          │  MessagesGateway    (room = userId)     │
│  └─ SocketProvider (Context)          │          │  ├─ handleConnection                   │
│     ├─ useMessagesSocket() ───────────┼───WS #1──┤  │   auth via handshake.headers.cookie   │
│     │  send_message / mark_read       │          │  │   OR handshake.auth.cookie  ← RN      │
│     │  new_message / message_read     │          │  ├─ @SubscribeMessage('send_message')   │
│     ├─ useNotificationsSocket() ──────┼───WS #2──┤  │   ack {status,messageId,ts}; emit     │
│     │  new_notification (incoming)    │          │  │   new_message to recipient + sender   │
│     └─ pub/sub fan-out (Set<cb>)      │          │  ├─ @SubscribeMessage('mark_read')      │
│                                       │          │  │   ack {status,lastReadAt}; emit       │
│  Page-level onNewMessage: early-return│          │  │   message_read to both parties        │
│  for sender-self-echo                 │          │  └─                                     │
│                                       │          │                                         │
│  REST Client (axios, w/ cookies)      │          │  NotificationsGateway (room =           │
│  GET  /chats/summary, /history,        ┼──HTTP────┼─▶  notifications:<userId>)             │
│  POST /chats/read, /init              │          │  AiGateway (room = userId)              │
│                                       │          │                                         │
│  Global Sidebars (layout)             │          │  MessagesController (REST)              │
│  ├─ EmployerSidebar ─ useUnread…      ┼──fan-out─┤  ├─ GET  /chats/summary                  │
│  └─ CandidateSidebar ─ useUnread…     ┼──fan-out─┤  ├─ GET  /chats/history/:friendId        │
│                                       │          │  ├─ POST /chats/read/:friendId           │
│  Topbar Bell (topbar) ─ useNotifs()   │          │  └─ POST /chats/init/:friendId           │
│                                       │          │                                         │
│  Pages / In-page Components           │          │  MessagesService                        │
│  ├─ /employer/messages ─ onNewMessage─┼──fan-out─┤  ├─ sendMessage → {messageId, ts}        │
│  ├─ /candidate/messages (duplicate)    │          │  ├─ getChatListSummary                  │
│  ├─ ConversationSidebar / ChatWindow   │          │  ├─ getChatHistory                      │
│  └─ MessageBubble                      │          │  ├─ markAsRead → ISO string             │
│                                       │          │  └─ createConversation                  │
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
                                                 │     applyNewMessageToSummary)
                                                 ├─ queryClient.setQueryData(['chat-history', msg.chatId],
                                                 │     applyNewMessageToHistory)
                                                 └─ useUnreadDot reads ['chat-summary', userId] and
                                                    recomputes its flag automatically

The chat screen [chatId].tsx doesn't subscribe to onNewMessage at all — React Query
re-renders it when the chat-history cache changes.
```

---

## 7. Conversation Initiation Flow

### 7a. Web (legacy)

`apps/web/src/hooks/useMessageCandidate.ts` + `apps/web/src/api-hook/messages/useInitializeConversation.ts`:

1. Click "Message" on a candidate/employer profile
2. `useInitializeConversation.initChat(userId, targetId)` — checks existing via `getChatSummary()`; if none, `POST /api/chats/init/:friendId` (REST) → upserts both rows → refetches
3. Navigates to `/employer/messages?candidateId=...` or `/candidate/messages?recruiterId=...`
4. **Bug:** the employer page ignores `?candidateId=` — only the candidate page's `?recruiterId=` is read

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

### 8b. Web — two consumer paths for the same `new_message` event

Both subscribe to the same `onNewMessage` hub in `SocketProvider` but update the UI with **different rules**. This is the most subtle part of the architecture.

**1. In-page conversation list** — `features/employer/messages/page.tsx:154-222`:

- `unread` flag on the matching conversation is set **optimistically** to `!isActiveChat`. The WS payload has no `hasUnread` field.
- The matching conversation is **bubbled to the top** with a stable sort (not a timestamp sort; other rows keep their existing order).
- The active thread receives the new message and `mark_read` is emitted (if the page is visible).
- **No refetch** is performed — the optimistic state stays until the next summary fetch.
- Does **not** listen to `message_read`.
- Early-returns at the top of the callback if `message.senderId === currentUser.id` (sender-self-echo fix).

**2. Global navigation sidebars** — `useUnreadMessagesDot` (`apps/web/src/hooks/useMessages.ts:20-120`):

- Subscribes via `useSocket().onNewMessage`.
- If `activeChatId !== message.senderId`, flips the global `hasUnreadMessages` flag to `true` **immediately**.
- **Then refetches** `GET /api/chats/summary` to recompute from the server's authoritative `hasUnread`. The only place that does the refetch.
- Also refetches on `message_read` events (peer reads one of your messages — no flag change, but re-validation).
- The flag clears when the user opens a conversation: the page optimistically sets `unread: false`, emits `mark_read`, and the next `fetchChatSummary` flows through `computeUnreadStatus` (`useMessages.ts:32-39`).

### 8c. Why the web paths are not symmetric

The list and the sidebar dot answer slightly different questions:

- **List** = "is _this_ conversation unread, and where should it sit in the list?"
- **Sidebar dot** = "is _any_ conversation unread right now?"

The list can be briefly wrong (the optimistic `unread: !isActiveChat` may disagree with the server's timestamp-based truth). The sidebar dot is self-correcting because it always re-derives from the server via `fetchChatSummary` after each `new_message`. No background polling.

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

| File                                                                     | Role                                                                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `app/providers.tsx:23-55`                                                | Root provider tree; mounts `SocketProvider` + `<GlobalAiSocket />`                                                    |
| `app/employer/messages/page.tsx`, `app/candidate/messages/page.tsx`      | Thin re-exports of `features/.../page.tsx`                                                                            |
| `app/employer/layout.tsx:79`, `app/candidate/layout.tsx:26`              | Mount the global sidebars                                                                                             |
| `features/employer/messages/page.tsx` (1-356)                            | Employer messaging page (owns `conversations` state, WS `new_message` handler; has early-return for sender-self-echo) |
| `features/candidate/messages/page.tsx` (1-401)                           | Near-duplicate; reads `?recruiterId=`                                                                                 |
| `features/employer/messages/ChatWindow.tsx` (1-235)                      | Right panel: message history, input, send                                                                             |
| `features/employer/messages/ConversationSidebar.tsx` (1-126)             | Left panel: searchable list, emits `mark_read` on click                                                               |
| `features/employer/messages/MessageBubble.tsx` (1-60)                    | Individual message renderer                                                                                           |
| `features/employer/messages/types.ts`, `utils.ts`                        | UI types + date/avatar/display helpers                                                                                |
| `components/employer/employerSidebar.tsx` (84-89, 156-158, 209-211)      | Global nav sidebar (`useUnreadMessagesDot`)                                                                           |
| `components/candidate/candidateSidebar.tsx` (110-113, 158-160, 206, 222) | Global nav sidebar (`useUnreadMessagesDot`)                                                                           |
| `components/employer/employerTopBar.tsx` (27-39, 131-135)                | Topbar with notification bell (`useNotifications`)                                                                    |
| `components/candidate/candidateTopBar.tsx` (16-30, 88-92)                | Topbar with notification bell (`useNotifications`)                                                                    |
| `contexts/socket-provider.tsx` (1-137)                                   | Owns **two** Socket.IO clients; `Set<callback>` pub/sub; exposes `useSocket()`                                        |
| `hooks/useMessagesSocket.ts` (1-254)                                     | Messages socket (`send_message`, `mark_read`, `new_message`, `message_read`)                                          |
| `hooks/useNotificationsSocket.ts` (1-89)                                 | Notifications socket (`new_notification`)                                                                             |
| `hooks/useAiSocket.ts` (1-96)                                            | AI socket (`RESUME_PARSED_<u>`, `RESUME_SCORED_<u>`)                                                                  |
| `hooks/useMessages.ts` (1-120)                                           | `useUnreadMessagesDot()` — turns WS into global sidebar dot                                                           |
| `hooks/useNotifications.ts` (1-120)                                      | Topbar bell state from `useNotificationsSocket`                                                                       |
| `hooks/useMessageCandidate.ts` (1-50)                                    | Conversation initiator (navigates with `?candidateId=`)                                                               |
| `hooks/useUser.ts` (1-30)                                                | `User` type + session hook (better-auth)                                                                              |
| `api-client/messages/types.ts` (1-36)                                    | API response types                                                                                                    |
| `api-client/messages/public.ts` (1-73)                                   | Axios REST client                                                                                                     |
| `api-hook/messages/useGetChatSummary.ts` (1-43)                          | Wraps REST in `useState`                                                                                              |
| `api-hook/messages/useChatHistory.ts` (1-43)                             | Wraps REST in `useState`                                                                                              |
| `api-hook/messages/useInitializeConversation.ts` (1-68)                  | **Used** by dashboard/applications pages                                                                              |
| `api-hook/messages/useInitConversation.ts`                               | **Unused** (legacy — delete)                                                                                          |
| `api-hook/messages/useMarkChatRead.ts`                                   | **Unused** (UI uses WS `mark_read` only)                                                                              |

### Frontend — mobile (`apps/mobile/src/`)

| File                                                                                                                                                                      | Role                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/_layout.tsx`                                                                                                                                                         | Root layout; mounts `<SocketProvider>` inside `<QueryClientProvider>` (shared `queryClient` from `lib/query-client.ts`); `<Toast />` at top offset 60                                                                                                                                                        |
| `app/pages/employer/messages/index.tsx`                                                                                                                                   | Conversation list screen; `useChatSummary`; tap → `router.push` to chat detail                                                                                                                                                                                                                               |
| `app/pages/employer/messages/[chatId].tsx`                                                                                                                                | Chat detail (header, `FlatList` of `MessageBubble`s sorted ASCENDING, `useEffect` auto-scroll to bottom on `[messages.length]`, `MessageInput`); wires `useChatSummary`, `useChatHistory`, `useSendMessage`, `useMarkAsReadOnFocus`, `useEnsureSummaryLoaded`, `useSocket`                                   |
| `app/pages/employer/messages/components/MessageListItem.tsx`                                                                                                              | Conversation row; `isUnread` prop, blue dot (testID `unread-dot`)                                                                                                                                                                                                                                            |
| `app/pages/employer/messages/components/{MessagesSearchBar,MessagesLoading,MessagesError,ChatHeader,MessageBubble,MessageInput,ChatEmptyState,ChatLoading,ChatError}.tsx` | All chat screen supporting components (also imported by the candidate pages via `../../employer/messages/components/…`)                                                                                                                                                                                       |
| `app/pages/employer/messages/utils.ts`                                                                                                                                    | `mapChatSummaryToConversation`, `formatTimestamp`, `filterBySearch`, `withDateSeparators`, `mapChatHistoryToMessage`, `Message` UI type (reused by candidate pages)                                                                                                                                          |
| `app/pages/employer/messages/types.ts`                                                                                                                                    | UI `Conversation` type (reused by candidate pages)                                                                                                                                                                                                                                                           |
| `app/pages/employer/dashboard/index.tsx`                                                                                                                                  | Migrated from `useGetChatSummary` to `useChatSummary` (React Query)                                                                                                                                                                                                                                          |
| `app/pages/employer/dashboard/components/EmployerDashboardSidebar.tsx`                                                                                                    | Wires `useUnreadDot(employerProfile?.id)`; renders small blue dot (testID `sidebar-unread-dot`) on the Messages nav item; replaced hardcoded `badge: 1`                                                                                                                                                          |
| `app/pages/candidate/messages/index.tsx`                                                                                                                                   | Candidate list page (mirrors employer); uses `useGetCandidateProfile` instead of `useGetEmployerProfile`; same hooks and components                                                                                                                                                                          |
| `app/pages/candidate/messages/[chatId].tsx`                                                                                                                                | Candidate chat detail (mirrors employer); only the profile hook and component-import paths differ                                                                                                                                                                                                            |
| `app/pages/candidate/dashboard/components/CandidateDashboardSidebar.tsx`                                                                                                    | Wires `useUnreadDot(candidateProfile?.id)`; renders small blue dot (testID `sidebar-unread-dot`) on the Messages nav item; no hardcoded badge (replaces the static `badge: 1` block with a true unread indicator driven by React Query)                                                                       |
| `lib/query-client.ts`                                                                                                                                                     | Shared `QueryClient` with mobile-aware defaults: `staleTime: 30s`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`, mutations `retry: 0`                                                                                                                               |
| `lib/utils.ts`                                                                                                                                                            | `uuid()` helper (RFC4122 v4 via `crypto.getRandomValues`)                                                                                                                                                                                                                                                    |
| `hooks/useMessagesSocket.ts`                                                                                                                                              | Module-level singleton; RN config (strips `/api` from `API_BASE_URL`, forces `transports: ['websocket']`, function-form `auth`); typed `emitSendMessage` / `emitMarkRead`; one-line `[ws]` breadcrumb logs; `_resetSocketForTests`                                                                           |
| `contexts/SocketProvider.tsx`                                                                                                                                             | `useSocket()` / `useSocket` context; `Set<cb>` registry; `AppState` listener invalidates `['chat-summary']` on `active` (no `socket.connected` guard — see §11); handles both `new_message` and `message_read` (self-updating via `applyMessageReadToSummary`)                                               |
| `contexts/cacheUpdaters.ts`                                                                                                                                               | Pure functions: `applyNewMessageToSummary` (returns `undefined`, not `[]`, when cache is empty), `applyMessageReadToSummary` (WS-side), `applyNewMessageToHistory` (de-dup by real `messageId` + 5s `localId` window), `applyMarkReadToSummary` (mutation-side mirror)                                       |
| `hooks/messaging/useChatSummary.ts`                                                                                                                                       | React Query wrapper: `useQuery({queryKey: ['chat-summary', userId], enabled: !!userId, staleTime: 30_000})`                                                                                                                                                                                                  |
| `hooks/messaging/useChatHistory.ts`                                                                                                                                       | React Query `useInfiniteQuery` (cursor pagination stubbed)                                                                                                                                                                                                                                                   |
| `hooks/messaging/useSendMessage.ts`                                                                                                                                       | React Query `useMutation` with optimistic insert (`local-{uuid}`), 10-second timeout, ack swap, rollback + toast on error                                                                                                                                                                                    |
| `hooks/messaging/useMarkAsRead.ts`                                                                                                                                        | React Query `useMutation` wrapping `emitMarkRead`; 10-second ack safety timeout (`mark_read_timeout`); `onSuccess` uses **partial-key `setQueriesData`** with `applyMarkReadToSummary` and does **NOT** call `invalidateQueries` (would race Scylla's eventual consistency and clobber the optimistic write) |
| `hooks/messaging/useMarkAsReadOnFocus.ts`                                                                                                                                 | Debounced (500ms) mark-read on mount + on `AppState→active`; **gated on `friendId`** to avoid emitting `mark_read` with an empty recipient on a cold mount (would write a `last_seen` row for `chatId = sort([userId, '']).join(':')`)                                                                       |
| `hooks/messaging/useUnreadDot.ts`                                                                                                                                         | Role-agnostic: takes `userId?: string`; returns `(summaries ?? []).some(s => s.hasUnread)` from `useChatSummary(userId)`. Both `EmployerDashboardSidebar` and `CandidateDashboardSidebar` pass their respective profile id.                                                                                  |
| `hooks/messaging/useEnsureSummaryLoaded.ts`                                                                                                                               | Refetches `['chat-summary', userId]` once if the chatId isn't in the cache (cold-cache deeplink)                                                                                                                                                                                                             |
| `hooks/messaging/useInitConversation.ts`                                                                                                                                  | React Query `useMutation` for `POST /chats/init/:friendId`; on success invalidates `chat-summary` and `router.push` to chat detail                                                                                                                                                                           |
| `hooks/messaging/useMessageCandidate.ts`                                                                                                                                  | Thin wrapper over `useInitConversation` with `{employerId, candidateId}`                                                                                                                                                                                                                                     |
| `hooks/useGetChatSummary.ts`                                                                                                                                              | **DELETED** (replaced by `hooks/messaging/useChatSummary.ts`; the dashboard now uses `useChatSummary` too)                                                                                                                                                                                                   |
| `api/messages.ts`                                                                                                                                                         | REST: `getChatSummary` / `getChatHistory` / `initConversation`                                                                                                                                                                                                                                               |
| `types/message.ts`                                                                                                                                                        | Full shared types (REST `ChatSummary` / `ChatMessage` / `ChatHistoryResponse` + WS `NewMessageEvent` / `MessageReadEvent` / `SendMessageRequest` / `SendMessageAck` / `MarkReadAck`)                                                                                                                         |

---

## 10. Mobile — Deferred Work

- **Push notifications** when the app is backgrounded — requires `expo-notifications` + APNs/FCM credentials.
- **Offline message queue** — failed sends surface a "tap to retry" toast; message text isn't preserved for retry.
- **Typing indicators** — backend has no `typing` event.
- **Read receipts in chat UI** ("Seen 2m ago") — backend emits `message_read` to the sender, but no UI renders it.
- **Attachments / images / voice** — web has none, mobile gets the same.
- **Server-side message search** — web has client-side filter only.
- **Mobile conversation initiation** — no "Message Employer" button on the candidate side yet (the candidate pages exist but the entry point from the candidate dashboard is missing); `useInitConversation` / `useMessageCandidate` are wired and ready.
- **Notifications socket on mobile** — no topbar bell yet; the architecture (one shared socket) is ready for it.
- **WS reconnection backfill for missed messages** — invalidates `['chat-summary']` on `AppState→active` is a partial fix; a "since-disconnect cursor" fetch would need backend support.
- **Multi-device session management** — sender-self-echo de-dup is built in; no "this conversation is open on N devices" UI.
- **Group chat / multiple participants** — backend model is 1:1 (`Conversation` keyed on a single `participantId`).
- **Message editing / deletion** — backend has no endpoints.

---

## 11. Known Issues, Gaps & Smells

Tracked for future work — not blockers.

### Web

- **Two near-duplicate message pages.** `features/candidate/messages/page.tsx` (401 lines) and `features/employer/messages/page.tsx` (350 lines) are ~90% identical. The candidate page imports `ConversationSidebar`, `ChatWindow`, `types`, `utils` from `features/employer/messages/…` — feature code living under `employer/` but consumed by `candidate/`. A single `features/messages/` would replace both.
- **Employer page ignores `?candidateId=`.** `useMessageCandidate` navigates to `/employer/messages?candidateId=…`, but `features/employer/messages/page.tsx` never reads `searchParams`. The candidate page does read `?recruiterId=` correctly. Inconsistent.
- **Two parallel "init conversation" hooks.** `useInitConversation.ts` is dead code; `useInitializeConversation.ts` is the one used. Delete one.
- **Dead `useMarkChatRead`.** The REST `POST /chats/read/:friendId` endpoint is wired in the backend and the api-hook layer, but the UI never calls it. Mark-as-read only happens via the `mark_read` WS event. No offline fallback if the socket is disconnected.
- **Optimistic sent messages are not reconciled.** Sent messages get `messageId: 'temp-${Date.now()}'`. With the new sender-self-echo early-return in `onNewMessage`, the duplicate `'socket-${Date.now()}'` message no longer appears — but the temp id stays in the list. The message looks correct, but the id is a lie. (Mobile: this is solved end-to-end with `local-{uuid}` → real `messageId` swap.)
- **Two sources of truth for "any unread?".** The in-page list and `useUnreadMessagesDot` both maintain their own `unread` state. They can briefly disagree (see §8c). (Mobile: solved via the React Query cache bus.)
- **Duplicate `mark_read` emissions on click.** `ConversationSidebar.handleSelectConversation` emits `mark_read`, and the page also auto-emits on initial-load auto-select and on receiving messages in the active chat. Idempotent on the server (`INSERT … now()`) but wasteful, and the page would silently stop syncing if the sidebar's emit were ever removed (the two are coupled by convention, not contract).
- **No React Query for messages.** Project already uses `@tanstack/react-query` for `useUser`; messages use raw `useState` + `axios` with no caching, dedup, retries, or background refetch. `fetchChatSummary` is called from at least three places (`useGetChatSummary`, `useUnreadMessagesDot`, dashboard pages). (Mobile: solved.)
- **Debug logging on in production.** `useMessagesSocket.ts:10` and `useNotificationsSocket.ts:9` hard-code `const DEBUG = true;`. Console output ships.
- **Two Socket.IO connections, one provider.** `useMessagesSocket` and `useNotificationsSocket` each open their own connection. They could be unified into a single `io()` that listens to both event namespaces. No functional reason to keep them separate.
- **Single-callback slot in the underlying hooks.** `useMessagesSocket.onNewMessage` uses `messageCallbackRef.current = callback` (overwrite), not a `Set`. The multi-subscriber fan-out only exists in `SocketProvider`. Anyone bypassing the context would silently lose subscribers.
- **`SocketProvider` re-registers its internal fan-out on every render of its parent** because `useMessagesSocket` returns a new object each render, so `[socketReturn]` is a fresh identity every frame. (Mobile: solved with the module-level singleton.)
- **No reconnection backfill.** If the socket disconnects and reconnects, no `fetchChatSummary` is fired — only `useUnreadMessagesDot` does it, and only on `new_message` / `message_read` events. Missed messages are not reconciled. (Mobile: partial fix via `AppState→active` invalidation.)
- **Notification hook has no reconnection cap.** `useNotificationsSocket` only sets `reconnection: true`; it will hammer the server with default backoff forever. `useMessagesSocket` caps at 10 attempts.
- **No session refresh on reconnect.** If the `better-auth.session_token` cookie expires while the tab is backgrounded, the WS fails to re-auth silently. (Mobile partially addressed: backend now also reads `handshake.auth.cookie` — the RN client sends the cookie from SecureStore on every reconnect.)

### Backend

- **Latent `LIMIT 1` ordering bug in `messages.service.ts:146-150`.** The `SELECT message_id, sender_id FROM messages WHERE chat_id = ? LIMIT 1` query has no `ORDER BY`. ScyllaDB's clustering order is **ascending** on `message_id` (TimeUuid), so the first row returned is the **oldest** in the partition, not the latest. The subsequent comparison to `last_read` (`hasUnread = messageTimestamp > lastReadTimestamp`, line 173) can therefore evaluate against a stale message. Fix: `ORDER BY message_id DESC LIMIT 1`.
- **Inconsistent room naming.** `messages.gateway.ts:42` and `ai.gateway.ts:31` use `userId` directly as the room name; `notifications.gateway.ts:31` uses `notifications:${userId}`. Works today but blocks any future "broadcast to a user's every device" feature.
- **`getChatHistory` has no cursor pagination.** The mobile `useChatHistory` is built with `useInfiniteQuery` (for forward compatibility) but the server returns the first 50 messages on every call. Adding cursor support requires backend work.
- **`getChatHistory` has no `ORDER BY` clause.** The `SELECT * FROM messages WHERE chat_id = ? LIMIT ?` query in `messages.service.ts:232-274` returns rows in arbitrary order, so the mobile chat screen's own sent messages can render off-screen or be de-duped by `keyExtractor` collisions when combined with an inverted `FlatList`. The mobile `withDateSeparators` now sorts ASCENDING client-side, which masks the symptom. The web happens to render correctly today because of `keyExtractor` dedup luck. The right fix is `ORDER BY message_id ASC` (or `DESC`).
- **Notifications + AI gateways do not yet accept `handshake.auth.cookie`.** Only `messages.gateway.ts` was updated for RN cookie-merge in this iteration. A mobile client trying to consume notifications or AI events would fail to authenticate.

### Mobile (open)

- **No cursor pagination in `useChatHistory`.** Server returns the first 50 messages; older history is not loadable. `getNextPageParam` is stubbed to return `undefined`.
- **No offline send queue.** If the socket is disconnected and the user sends a message, the optimistic insert is shown for up to 10 seconds, then rolled back with a "Couldn't send — tap to retry" toast. Message text isn't preserved for retry.
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
