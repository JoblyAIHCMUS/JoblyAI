import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly activeChats = new Map<string, string>();

  setActiveChat(userId: string, chatId: string | null) {
    if (chatId) {
      this.activeChats.set(userId, chatId);
    } else {
      this.activeChats.delete(userId);
    }
  }

  clearUser(userId: string) {
    this.activeChats.delete(userId);
  }

  isViewingChat(userId: string, chatId: string) {
    return this.activeChats.get(userId) === chatId;
  }
}