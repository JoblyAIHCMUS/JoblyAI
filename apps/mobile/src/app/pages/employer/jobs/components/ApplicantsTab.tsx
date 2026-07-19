import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Search, Star, X } from 'lucide-react-native';
import Avatar from '../../../../../components/Avatar';
import { PipelineView } from './PipelineView';

export type ApplicantStatus =
  | 'In-review'
  | 'Rejected'
  | 'Withdrawn'
  | 'Interviewed'
  | 'Hired';

export interface Applicant {
  id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  status: ApplicantStatus;
  appliedDate: string;
}

interface ApplicantsTabProps {
  applicants: Applicant[];
  total: number;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  isRefetching: boolean;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onUpdateStage?: (applicantId: string, newStage: ApplicantStatus) => void;
  isUpdating?: boolean;
}

const getStatusColors = (status: ApplicantStatus) => {
  switch (status) {
    case 'In-review':
      return { border: 'border-app-orange-1', text: 'text-app-orange-1' };
    case 'Rejected':
      return { border: 'border-app-red-1', text: 'text-app-red-1' };
    case 'Withdrawn':
      return { border: 'border-app-gray-3', text: 'text-app-gray-3' };
    case 'Interviewed':
      return { border: 'border-app-secondary-2', text: 'text-app-secondary-2' };
    case 'Hired':
      return { border: 'border-app-emerald-2', text: 'text-app-emerald-2' };
    default:
      return { border: 'border-app-border-2', text: 'text-app-text-3' };
  }
};

function ApplicantListItem({ applicant }: { applicant: Applicant }) {
  const statusColors = getStatusColors(applicant.status);

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-app-border-light">
      <View className="flex-row items-center flex-1">
        <Avatar
          url={applicant.avatarUrl}
          name={applicant.name}
          size={56}
          className="mr-4"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-app-slate-1 mb-1">
            {applicant.name}
          </Text>
          <View className="flex-row items-center border border-app-border-2 rounded-full px-2 py-0.5 self-start">
            <Star
              size={14}
              color="#FFB836"
              fill={applicant.rating > 0 ? '#FFB836' : 'transparent'}
            />
            <Text className="text-sm text-app-text-3 font-medium ml-1">
              {applicant.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
      <View
        className={`border rounded-full px-4 py-1.5 ${statusColors.border}`}
      >
        <Text className={`text-sm font-semibold ${statusColors.text}`}>
          {applicant.status}
        </Text>
      </View>
    </View>
  );
}

function ApplicantsHeader({
  total,
  isLoading,
  searchQuery,
  onSearchChange,
}: {
  total: number;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (text: string) => void;
}) {
  const [isSearching, setIsSearching] = useState(false);

  if (isSearching) {
    return (
      <View className="flex-row items-center py-3 border-b border-app-border-light">
        <View className="flex-1 flex-row items-center bg-app-background-1 rounded-lg px-3 py-2 mr-3">
          <Search size={20} color="#64748B" />
          <TextInput
            className="flex-1 ml-2 text-base text-app-slate-1 p-0"
            placeholder="Search applicants..."
            value={searchQuery}
            onChangeText={onSearchChange}
            autoFocus
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            setIsSearching(false);
            onSearchChange('');
          }}
        >
          <Text className="text-app-primary-1 font-semibold text-base">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-app-border-light">
      <Text className="text-xl font-bold text-app-slate-1">
        Applicants : {isLoading ? '...' : total}
      </Text>
      <View className="flex-row gap-4">
        <TouchableOpacity onPress={() => setIsSearching(true)}>
          <Search size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ViewToggle({
  active,
  setActive,
}: {
  active: 'Pipeline' | 'Table';
  setActive: (val: 'Pipeline' | 'Table') => void;
}) {
  return (
    <View className="flex-row bg-app-background-1 rounded-lg p-1 my-4">
      <TouchableOpacity
        className={`flex-1 py-2 items-center rounded-md ${
          active === 'Pipeline' ? 'bg-white shadow-sm' : ''
        }`}
        onPress={() => setActive('Pipeline')}
      >
        <Text className="text-base font-semibold text-app-primary-1">
          Pipeline View
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 py-2 items-center rounded-md ${
          active === 'Table' ? 'bg-white shadow-sm' : ''
        }`}
        onPress={() => setActive('Table')}
      >
        <Text className="text-base font-semibold text-app-primary-1">
          Table View
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ApplicantsTab({
  applicants,
  total,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  refetch,
  isRefetching,
  searchQuery,
  onSearchChange,
  onUpdateStage,
  isUpdating,
}: ApplicantsTabProps) {
  const [activeView, setActiveView] = useState<'Pipeline' | 'Table'>('Table');
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#4640DE" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null; // Initial loading handled by header
    return (
      <View className="items-center py-10">
        <Text className="text-base text-app-text-3">No applicants found.</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {activeView === 'Table' ? (
        <FlatList
          data={applicants}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <ApplicantListItem applicant={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <ApplicantsHeader
                total={total}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
              />
              <ViewToggle active={activeView} setActive={setActiveView} />
            </>
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#4640DE']}
            />
          }
        />
      ) : (
        <View className="flex-1">
          <View className="px-4">
            <ApplicantsHeader
              total={total}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            <ViewToggle active={activeView} setActive={setActiveView} />
          </View>
          <PipelineView
            applicants={applicants}
            onUpdateStage={onUpdateStage}
            isUpdating={isUpdating}
          />
        </View>
      )}
    </View>
  );
}
