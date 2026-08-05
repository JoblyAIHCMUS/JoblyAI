import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { useSearchEmployers } from '../../../../../hooks/useSearchEmployers';
import type { TeamMember } from '../data';
import { COLORS } from '@/app/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardDismissView } from '@/components/KeyboardDismissView';

interface TeamMemberSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (member: TeamMember) => void;
  excludeEmails: string[];
}

export const TeamMemberSearch: React.FC<TeamMemberSearchProps> = ({
  open,
  onOpenChange,
  onSelect,
  excludeEmails,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { results: employerResults, loading, search } = useSearchEmployers();

  useEffect(() => {
    if (!open) {
      return;
    }

    void search(searchQuery);
  }, [open, searchQuery, search]);

  const filteredEmployers = employerResults
    .map((member) => ({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      avatar: member.avatarUrl,
      role: 'employee',
    }))
    .filter((user) => !excludeEmails.includes(user.email));

  const handleSelect = (member: TeamMember) => {
    onSelect(member);
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSearchQuery('');
    onOpenChange(nextOpen);
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => handleOpenChange(false)}
    >
      <KeyboardDismissView className="flex-1 bg-black/50 flex items-center justify-end">
        <SafeAreaView
          edges={['bottom']}
          className="w-full rounded-t-2xl bg-white max-h-96 pb-3"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200">
            <Text className="text-lg font-bold text-slate-900">
              Add Team Members
            </Text>
            <TouchableOpacity onPress={() => handleOpenChange(false)}>
              <X size={24} color={COLORS.slate500} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="px-4 py-3 border-b border-slate-200">
            <View className="flex-row items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Search size={18} color={COLORS.slate500} strokeWidth={1.5} />
              <TextInput
                placeholder="Search by name or email..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor={COLORS.slate400}
              />
              {searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color={COLORS.slate500} strokeWidth={1.5} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results */}
          <FlatList
            data={filteredEmployers}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                className="px-4 py-3 border-b border-slate-100 flex-row items-center justify-between active:bg-slate-50"
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                    {item.avatar ? (
                      <Image
                        source={{ uri: item.avatar }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-sm font-bold text-indigo-600">
                        {item.firstName[0]}
                        {item.lastName[0]}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-slate-900 truncate">
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text className="text-xs text-slate-500 truncate">
                      {item.email}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="px-4 py-8 flex items-center justify-center">
                {loading && searchQuery ? (
                  <ActivityIndicator size="small" color={COLORS.primary2} />
                ) : (
                  <Text className="text-sm text-slate-500 text-center">
                    {searchQuery
                      ? 'No team members found'
                      : 'Start typing to search for team members'}
                  </Text>
                )}
              </View>
            }
            scrollEnabled={true}
          />
        </SafeAreaView>
      </KeyboardDismissView>
    </Modal>
  );
};

export default TeamMemberSearch;
