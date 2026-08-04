import { useEffect, useMemo, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
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
import { useKeyboardHeight } from '../../../../hooks/useKeyboardHeight';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { withDateSeparators } from './utils';
import { emitChatOpened, emitChatClosed } from '@/hooks/useMessagesSocket';
import { AppState } from 'react-native';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { data: profile } = useGetEmployerProfile();
  const userId = profile?.id ?? '';
  const keyboardHeight = useKeyboardHeight();
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        emitChatClosed();
      } else if (chatId) {
        emitChatOpened(chatId);
      }
    });

    return () => sub.remove();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    emitChatOpened(chatId);

    return () => {
      emitChatClosed();
    };
  }, [chatId]);

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
      withDateSeparators(
        (historyData?.pages ?? []).flatMap((p) => p),
        userId
      ),
    [historyData, userId]
  );

  // 3.5. Auto-scroll to bottom on new messages (mirrors web's
  //      useEffect at apps/web/src/features/employer/messages/ChatWindow.tsx:39-44)
  const listRef = useRef<FlatList>(null);
  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ChatHeader
          name={summary?.participantName ?? 'Chat'}
          avatar={summary?.participantAvatar ?? null}
          role={summary?.participantRole ?? null}
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
          avatar={summary?.participantAvatar ?? null}
          role={summary?.participantRole ?? null}
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
        avatar={summary?.participantAvatar ?? null}
        role={summary?.participantRole ?? null}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.messageId}
          renderItem={({ item }) => <MessageBubble message={item} />}
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
