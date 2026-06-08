import { Briefcase } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

import type { ApplicationTab } from '../../dashboard/types';

interface ApplicationsEmptyStateProps {
  activeTab: ApplicationTab;
  searchQuery: string;
}

export function ApplicationsEmptyState({
  activeTab,
  searchQuery,
}: ApplicationsEmptyStateProps) {
  const message = searchQuery.trim()
    ? `No applications match “${searchQuery.trim()}”.`
    : activeTab === 'ALL'
    ? 'No applications found for this period.'
    : `No ${activeTab.toLowerCase().replace('_', ' ')} applications found.`;

  return (
    <View className="mt-3 rounded-2xl border border-app-border-light bg-app-neutral-1 px-6 py-12">
      <View className="items-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-app-indigo-soft">
          <Briefcase size={24} color="#4F46E5" strokeWidth={2.1} />
        </View>

        <View className="items-center gap-2">
          <Text className="text-base font-semibold text-app-text-4">
            No applications yet
          </Text>
          <Text className="text-center text-sm leading-5 text-app-text-5">
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
}
