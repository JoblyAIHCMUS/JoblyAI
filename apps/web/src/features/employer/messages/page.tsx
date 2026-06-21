'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useSocket } from '@/contexts/socket-provider';
import { useChatSummary } from '@/hooks/messaging/useChatSummary';
import { useMarkAsRead } from '@/hooks/messaging/useMarkAsRead';
import { useMarkAsReadOnFocus } from '@/hooks/messaging/useMarkAsReadOnFocus';
import { useEnsureSummaryLoaded } from '@/hooks/messaging/useEnsureSummaryLoaded';
import { useGetEmployerProfile } from '@/api-hook/employer';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { Conversation } from './types';
import { mapChatSummaryToConversation } from './utils';

export default function EmployerMessagesPage() {
  const { data: currentUser, isPending: userLoading } = useUser();
  const { data: employerProfile } = useGetEmployerProfile();

  const userId = currentUser?.id;
  const currentUserAvatar = employerProfile?.avatarUrl ?? null;
  const searchParams = useSearchParams();
  const deeplinkCandidateId = searchParams.get('candidateId');
  const {
    data: summaries = [],
    isLoading: summariesLoading,
    error,
  } = useChatSummary(userId);
  const { activeChatId, setActiveChatId } = useSocket();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  // Mobile view state: true = show conversations, false = show chat
  const [showConversationsList, setShowConversationsList] = useState(true);

  useEnsureSummaryLoaded(
    summaries.find((c) => c.chatId === selectedConversation?.chatId),
    userId
  );

  const conversations = useMemo(
    () => summaries.map(mapChatSummaryToConversation),
    [summaries]
  );

  // Keep the socket context's activeChatId in sync with the page's selection.
  useEffect(() => {
    if (selectedConversation) {
      setActiveChatId(selectedConversation.participantId);
      return () => setActiveChatId(null);
    }
    return undefined;
  }, [selectedConversation?.participantId, setActiveChatId]);

  // Auto-select on mount and on deeplink.
  useEffect(() => {
    if (!conversations.length) return;
    setSelectedConversation((prev) => {
      if (prev) return prev;
      const deeplinked = deeplinkCandidateId
        ? conversations.find((c) => c.participantId === deeplinkCandidateId)
        : undefined;
      return deeplinked ?? conversations[0];
    });
  }, [conversations, deeplinkCandidateId]);

  const markAsRead = useMarkAsRead({
    chatId: selectedConversation?.chatId ?? '',
    friendId: selectedConversation?.participantId,
    userId: userId ?? '',
  });
  useMarkAsReadOnFocus({
    chatId: selectedConversation?.chatId ?? '',
    friendId: selectedConversation?.participantId,
    userId: userId ?? '',
  });

  if (userLoading || summariesLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-white">
        <p className="text-slate-500">Loading messages...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-white">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-hidden">
      {/* Desktop layout: side by side */}
      <div className="hidden lg:flex w-full h-full gap-0 overflow-hidden bg-white flex-1">
        <ConversationSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          activeChatId={activeChatId}
          onSelectConversation={(c) => {
            setSelectedConversation(c);
            setShowConversationsList(false);
          }}
          onMarkAsRead={() => markAsRead.mutate()}
          isLoading={summariesLoading}
        />
        {selectedConversation && userId ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={userId}
            currentUserAvatar={currentUserAvatar}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <p className="text-slate-500">Select a conversation to start</p>
          </div>
        )}
      </div>

      {/* Tablet and Mobile layout: toggle between conversations and chat */}
      <div className="flex lg:hidden w-full h-full gap-0 overflow-hidden bg-white flex-1">
        {showConversationsList && (
          <div className="w-full h-full">
            <ConversationSidebar
              conversations={conversations}
              selectedConversation={selectedConversation}
              activeChatId={activeChatId}
              onSelectConversation={(c) => {
                setSelectedConversation(c);
                setShowConversationsList(false);
              }}
              onMarkAsRead={() => markAsRead.mutate()}
              isLoading={summariesLoading}
              isMobileView
            />
          </div>
        )}
        {!showConversationsList && selectedConversation && userId ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={userId}
            currentUserAvatar={currentUserAvatar}
            onBackClick={() => setShowConversationsList(true)}
            isMobileView
          />
        ) : (
          !showConversationsList && (
            <div className="flex-1 flex items-center justify-center bg-white">
              <p className="text-slate-500">Select a conversation to start</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
