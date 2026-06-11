import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import MessagesSearchBar from './components/MessagesSearchBar';
import MessageListItem from './components/MessageListItem';
import MessagesLoading from './components/MessagesLoading';
import MessagesError from './components/MessagesError';
import { mapChatSummaryToConversation } from './utils';
import { Conversation } from './types';
import { useGetChatSummary } from '../../../../hooks/useGetChatSummary';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';

export default function MessagesScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const { data: employerProfile, isLoading: profileLoading, refetch: fetchProfile } = useGetEmployerProfile();
  const { fetchChatSummary, data: chatSummary, loading, error } = useGetChatSummary();

  const userId = employerProfile?.id;

  const loadMessages = useCallback(async (uid: string) => {
    await fetchChatSummary(uid);
  }, [fetchChatSummary]);

  useEffect(() => {
    if (!userId || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadMessages(userId);
  }, [userId, loadMessages]);

  useEffect(() => {
    if (!profileLoading && userId) {
      setInitialLoading(false);
    }
  }, [profileLoading, userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: profile } = await fetchProfile();
      if (profile?.id) {
        await loadMessages(profile.id);
      }
    } catch {
      // silently swallow — previous data stays visible
    }
    setRefreshing(false);
  }, [loadMessages, fetchProfile]);

  const conversations = useMemo(
    () => (chatSummary || []).map(mapChatSummaryToConversation),
    [chatSummary]
  );

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.name.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery, conversations]);

  const handleConversationPress = (conversation: Conversation) => {
    console.log('Conversation pressed:', conversation.chatId);
  };

  const renderEmpty = () => (
    <View className="items-center py-10">
      <Text className="text-base font-normal text-app-slate-3">
        No messages found
      </Text>
    </View>
  );

  const renderContent = () => {
    if (initialLoading || (profileLoading && !userId)) {
      return <MessagesLoading />;
    }

    if (error && !chatSummary) {
      return (
        <MessagesError
          message={error instanceof Error ? error.message : 'Something went wrong'}
          onRetry={() => userId && loadMessages(userId)}
        />
      );
    }

    return (
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.chatId}
        renderItem={({ item }) => (
          <MessageListItem
            conversation={item}
            onPress={handleConversationPress}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />

      {renderContent()}

      <EmployerDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
