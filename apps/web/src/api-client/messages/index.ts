// Types
export type {
  ChatSummary,
  ChatMessage,
  SendMessageRequest,
  SendMessageResponse,
} from '@/api-client/messages/types';

// Public endpoints
export {
  getChatSummary,
  getChatHistory,
  markChatRead,
  initConversation,
} from '@/api-client/messages/public';
