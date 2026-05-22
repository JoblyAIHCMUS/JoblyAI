import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { mockEmployers } from '../data';
import type { TeamMember } from '../data';

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

  const filteredEmployers = mockEmployers.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      !excludeEmails.includes(emp.email) &&
      (fullName.includes(query) || emp.email.includes(query))
    );
  });

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1 bg-black/50 flex items-center justify-end">
        <View className="w-full bg-white rounded-t-2xl max-h-96">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200">
            <Text className="text-lg font-bold text-slate-900">
              Add Team Members
            </Text>
            <TouchableOpacity onPress={() => onOpenChange(false)}>
              <X size={24} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="px-4 py-3 border-b border-slate-200">
            <View className="flex-row items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Search size={18} color="#64748B" strokeWidth={1.5} />
              <TextInput
                placeholder="Search by name or email..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#94a3b8"
              />
              {searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color="#64748B" strokeWidth={1.5} />
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
                onPress={() => {
                  onSelect(item);
                  onOpenChange(false);
                  setSearchQuery('');
                }}
                className="px-4 py-3 border-b border-slate-100 flex-row items-center justify-between active:bg-slate-50"
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Text className="text-sm font-bold text-indigo-600">
                      {item.firstName[0]}
                      {item.lastName[0]}
                    </Text>
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
                <Text className="text-sm text-slate-500 text-center">
                  {searchQuery
                    ? 'No team members found'
                    : 'No available team members'}
                </Text>
              </View>
            }
            scrollEnabled={true}
          />
        </View>
      </View>
    </Modal>
  );
};

export default TeamMemberSearch;
