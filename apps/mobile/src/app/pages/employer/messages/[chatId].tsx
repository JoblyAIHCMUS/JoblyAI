import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import ChatHeader from './components/ChatHeader';
import ChatEmptyState from './components/ChatEmptyState';
import ChatError from './components/ChatError';
import ChatLoading from './components/ChatLoading';
import MessageBubble from './components/MessageBubble';
import MessageInput from './components/MessageInput';
import { useChatHistory } from '../../../../hooks/messaging/useChatHistory';
import { useChatSummary } from '../../../../hooks/messaging/useChatSummary';
import { useEnsureSummaryLoaded } from '../../../../hooks/messaging/useEnsureSummaryLoaded';
import { useMarkAsReadOnFocus } from '../../../../hooks/messaging/useMarkAsReadOnFocus';
import { useSendMessage } from '../../../../hooks/messaging/useSendMessage';
import { useSocket } from '../../../../contexts/SocketProvider';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { withDateSeparators } from './utils';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { data: profile } = useGetEmployerProfile();
  const userId = profile?.id ?? '';

  // 1. Conversation metadata from the summary cache
  const { data: summaries } = useChatSummary(userId || undefined);
  const summary = summaries?.find((c) => c.chatId === chatId);
  useEnsureSummaryLoaded(summary, userId || undefined);

  // 2. Message history
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useChatHistory(chatId, summary?.participantId);

  // 3. Flatten + decorate with date separators
  const messages = useMemo(
    () =>
      withDateSeparators((historyData?.pages ?? []).flatMap((p) => p)),
    [historyData]
  );

  // 4. Send
  const send = useSendMessage({
    chatId: chatId ?? '',
    friendId: summary?.participantId ?? '',
    userId,
  });

  // 5. Mark as read
  useMarkAsReadOnFocus({
    chatId: chatId ?? '',
    friendId: summary?.participantId ?? '',
    userId,
  });

  // 6. Connection state for the header dot
  const { isConnected } = useSocket();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ChatHeader
          name={summary?.participantName ?? 'Chat'}
          role={summary?.participantRole ?? null}
          avatar={summary?.participantAvatar ?? null}
          isOnline={isConnected()}
          onBack={() => router.back()}
        />
        <ChatLoading />
      </SafeAreaView>
    );
  }

  if (error && !historyData) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ChatHeader
          name={summary?.participantName ?? 'Chat'}
          role={summary?.participantRole ?? null}
          avatar={summary?.participantAvatar ?? null}
          isOnline={isConnected()}
          onBack={() => router.back()}
        />
        <ChatError
          message={
            error instanceof Error ? error.message : 'Something went wrong'
          }
          onRetry={refetch}
          onBack={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatHeader
        name={summary?.participantName ?? 'Chat'}
        role={summary?.participantRole ?? null}
        avatar={summary?.participantAvatar ?? null}
        isOnline={isConnected()}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.messageId}
          renderItem={({ item }) => (
            <MessageBubble message={item} currentUserId={userId} />
          )}
          inverted
          contentContainerStyle={{
            padding: 16,
            flexGrow: messages.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={<ChatEmptyState />}
        />
        <MessageInput
          onSend={(text) => send.mutate(text)}
          disabled={send.isPending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
