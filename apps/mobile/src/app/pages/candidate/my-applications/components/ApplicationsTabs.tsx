import { ScrollView, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

import type { ApplicationTab } from '../../dashboard/types';

export const APPLICATION_TABS: ApplicationTab[] = [
  'ALL',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const APPLICATION_TAB_LABELS: Record<ApplicationTab, string> = {
  ALL: 'All',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

interface ApplicationsTabsProps {
  activeTab: ApplicationTab;
  counts: Record<ApplicationTab, number>;
  onTabChange: (nextTab: ApplicationTab) => void;
}

export function ApplicationsTabs({
  activeTab,
  counts,
  onTabChange,
}: ApplicationsTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pb-1"
    >
      {APPLICATION_TABS.map((tab) => {
        const isActive = tab === activeTab;

        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
              isActive
                ? 'border-app-indigo-soft bg-app-indigo-soft'
                : 'border-app-border-light bg-white'
            }`}
            onPress={() => onTabChange(tab)}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? 'text-app-indigo-strong' : 'text-app-text-5'
              }`}
            >
              {APPLICATION_TAB_LABELS[tab]}
            </Text>

            <View
              className={`min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 ${
                isActive ? 'bg-white' : 'bg-app-background-2'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isActive ? 'text-app-indigo-strong' : 'text-app-text-5'
                }`}
              >
                {counts[tab]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
