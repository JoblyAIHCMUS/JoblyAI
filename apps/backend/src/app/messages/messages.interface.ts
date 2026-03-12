export interface ChatStatusResponse {
  chatId: string;
  latestMessage?: string;
  hasUnread: boolean;
}