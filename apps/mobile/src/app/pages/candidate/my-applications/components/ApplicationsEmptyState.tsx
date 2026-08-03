import { Briefcase } from 'lucide-react-native';
import { View } from 'react-native';
import { EmptyState } from '@/components/ui/feedback';

import type { ApplicationTab } from '../../dashboard/types';

interface ApplicationsEmptyStateProps {
  activeTab: ApplicationTab;
  searchQuery: string;
  onBrowseJobs?: () => void;
}

export function ApplicationsEmptyState({
  activeTab,
  searchQuery,
  onBrowseJobs,
}: ApplicationsEmptyStateProps) {
  const message = searchQuery.trim()
    ? `No applications match “${searchQuery.trim()}”.`
    : activeTab === 'ALL'
    ? 'No applications found for this period.'
    : `No ${activeTab.toLowerCase().replace('_', ' ')} applications found.`;

  return (
    <View className="mt-3">
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        message={message}
        actionLabel={!searchQuery.trim() ? 'Browse Jobs' : undefined}
        onAction={!searchQuery.trim() ? onBrowseJobs : undefined}
      />
    </View>
  );
}
