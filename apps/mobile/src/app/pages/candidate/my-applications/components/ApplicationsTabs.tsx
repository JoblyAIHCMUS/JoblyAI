import { ScrollView, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type ApplicationFilterTab = 'ALL' | 'ACTIVE' | 'CLOSED';

interface ApplicationsTabsProps {
  activeTab: ApplicationFilterTab;
  counts: Record<ApplicationFilterTab, number>;
  onTabChange: (nextTab: ApplicationFilterTab) => void;
}

const FILTER_TABS: Array<{ key: ApplicationFilterTab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'In Review' },
  { key: 'CLOSED', label: 'Closed' },
];

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
      {FILTER_TABS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
              isActive
                ? 'border-app-indigo-soft bg-app-indigo-soft'
                : 'border-app-border-light bg-white'
            }`}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? 'text-app-indigo-strong' : 'text-app-text-5'
              }`}
            >
              {tab.label}
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
                {counts[tab.key]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
