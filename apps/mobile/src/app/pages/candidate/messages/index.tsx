import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { CandidateHeader } from '@/components/header/CandidateHeader';
import CandidateDashboardSidebar from '../dashboard/components/CandidateDashboardSidebar';
import MessagesSearchBar from '../../employer/messages/components/MessagesSearchBar';
import MessageListItem from '../../employer/messages/components/MessageListItem';
import MessagesLoading from '../../employer/messages/components/MessagesLoading';
import MessagesError from '../../employer/messages/components/MessagesError';
import {
  mapChatSummaryToConversation,
  filterBySearch,
} from '../../employer/messages/utils';
import { Conversation } from '../../employer/messages/types';
import { useChatSummary } from '../../../../hooks/messaging/useChatSummary';
import { useGetCandidateProfile } from '../../../../hooks/useGetCandidateProfile';

export default function MessagesScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: profile } = useGetCandidateProfile();
  const userId = profile?.id;

  const {
    data: summaries,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useChatSummary(userId);

  const conversations = useMemo(
    () => (summaries ?? []).map(mapChatSummaryToConversation),
    [summaries]
  );

  const filtered = useMemo(
    () => filterBySearch(conversations, searchQuery),
    [conversations, searchQuery]
  );

  const handleConversationPress = useCallback((conv: Conversation) => {
    router.push({
      pathname: '/pages/candidate/messages/[chatId]',
      params: { chatId: conv.chatId },
    });
  }, []);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderEmpty = () => (
    <View className="items-center py-10">
      <Text className="text-base font-normal text-app-slate-3">
        No messages found
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <CandidateHeader
          title="Messages"
          initials={(profile?.firstName || 'U').slice(0, 2).toUpperCase()}
          onMenuPress={() => setIsSidebarOpen(true)}
        />
        <MessagesLoading />
        <CandidateDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </>
    );
  }

  if (error && !summaries) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <CandidateHeader
          title="Messages"
          initials={(profile?.firstName || 'U').slice(0, 2).toUpperCase()}
          onMenuPress={() => setIsSidebarOpen(true)}
        />
        <MessagesError
          message={
            error instanceof Error ? error.message : 'Something went wrong'
          }
          onRetry={onRefresh}
        />
        <CandidateDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <CandidateHeader
        title="Messages"
        initials={(profile?.firstName || 'U').slice(0, 2).toUpperCase()}
        onMenuPress={() => setIsSidebarOpen(true)}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.chatId}
        renderItem={({ item }) => (
          <MessageListItem
            conversation={item}
            onPress={handleConversationPress}
            isUnread={item.unread}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-semibold text-app-text-4 mb-4 mt-2">
              Messages
            </Text>
            <View className="mb-4">
              <MessagesSearchBar
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </View>
          </>
        }
        ListEmptyComponent={renderEmpty}
      />

      <CandidateDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
