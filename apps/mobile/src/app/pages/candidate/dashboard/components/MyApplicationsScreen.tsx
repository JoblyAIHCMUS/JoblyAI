import { useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { ApplicationsEmptyState } from './ApplicationsEmptyState';
import { ApplicationsFilterSheet } from './ApplicationsFilterSheet';
import { ApplicationsHeader } from './ApplicationsHeader';
import { ApplicationsTabs } from './ApplicationsTabs';
import { ApplicationCard } from './ApplicationCard';
import { FeatureBanner } from './FeatureBanner';
import { SearchFilterBar } from './SearchFilterBar';
import CandidateDashboardSidebar from './CandidateDashboardSidebar';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';

import { MOCK_APPLICATIONS, APPLICATION_TABS } from '../data/mockApplications';
import type { ApplicationTab, DatePreset } from '../types';
import {
  createDefaultDateRange,
  formatDateRangeLabel,
  formatInputDate,
  getDateRangeForPreset,
  isWithinDateRange,
  parseDateInput,
  toDateRangeInput,
} from '../utils';
import { getGreetingName, useUser } from '../../../../../hooks/useUser';

export function MyApplicationsScreen() {
  const { data: user } = useUser();
  const firstName = getGreetingName(user) || 'Do';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<ApplicationTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activePreset, setActivePreset] = useState<DatePreset>('LAST_7_DAYS');
  const [appliedDateRange, setAppliedDateRange] = useState(createDefaultDateRange());
  const [draftDateRange, setDraftDateRange] = useState(toDateRangeInput(createDefaultDateRange()));

  const greeting = new Date().getHours() < 12
    ? 'Good morning'
    : new Date().getHours() < 18
      ? 'Good afternoon'
      : 'Good evening';

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return MOCK_APPLICATIONS.filter((application) => {
      const matchesTab = activeTab === 'ALL' ? true : application.status === activeTab;
      const matchesDate = isWithinDateRange(application.appliedAt, appliedDateRange);
      const matchesSearch = normalizedQuery
        ? [application.title, application.company, application.location]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)
        : true;

      return matchesTab && matchesDate && matchesSearch;
    });
  }, [activeTab, appliedDateRange, searchQuery]);

  const tabCounts = useMemo(() => {
    return APPLICATION_TABS.reduce<Record<ApplicationTab, number>>(
      (counts, tab) => {
        if (tab === 'ALL') {
          counts.ALL = MOCK_APPLICATIONS.filter((application) =>
            isWithinDateRange(application.appliedAt, appliedDateRange)
          ).length;
          return counts;
        }

        counts[tab] = MOCK_APPLICATIONS.filter(
          (application) =>
            application.status === tab &&
            isWithinDateRange(application.appliedAt, appliedDateRange)
        ).length;

        return counts;
      },
      {
        ALL: 0,
        IN_REVIEW: 0,
        INTERVIEWING: 0,
        OFFERED: 0,
        HIRED: 0,
        REJECTED: 0,
      }
    );
  }, [appliedDateRange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (activeTab !== 'ALL') count += 1;
    if (searchQuery.trim().length > 0) count += 1;
    if (activePreset !== 'LAST_7_DAYS') count += 1;

    return count;
  }, [activePreset, activeTab, searchQuery]);

  const openFilterSheet = useCallback(() => {
    setDraftDateRange(toDateRangeInput(appliedDateRange));
    setFilterVisible(true);
  }, [appliedDateRange]);

  const applyDateRange = useCallback(() => {
    const parsedFrom = parseDateInput(draftDateRange.from);
    const parsedTo = parseDateInput(draftDateRange.to);

    if (!parsedFrom || !parsedTo) {
      return;
    }

    setAppliedDateRange({ from: parsedFrom, to: parsedTo });
    setFilterVisible(false);
  }, [draftDateRange.from, draftDateRange.to]);

  const clearFilters = useCallback(() => {
    const defaultRange = createDefaultDateRange();

    setAppliedDateRange(defaultRange);
    setDraftDateRange(toDateRangeInput(defaultRange));
    setActivePreset('LAST_7_DAYS');
    setActiveTab('ALL');
    setSearchQuery('');
    setFilterVisible(false);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-app-background-2">
        <ApplicationsHeader
          title="My Applications"
          onMenuPress={() => setIsSidebarOpen(true)}
        />

        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ApplicationCard application={item} />}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={
            <View className="gap-4 py-4">
              <View className="gap-2">
                <Text className="text-[28px] font-bold leading-8 text-app-text-4">
                  {greeting}, {firstName}
                </Text>
                <Text className="text-[15px] leading-6 text-app-text-5">
                  Here&apos;s the status of your applications from {formatDateRangeLabel(appliedDateRange)}.
                </Text>
              </View>

              <View className="flex-row items-center gap-2 rounded-2xl border border-app-border-light bg-white px-3 py-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-app-indigo-soft">
                  <Text className="text-xs font-bold text-app-indigo-strong">DH</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-app-text-4">
                    {formatDateRangeLabel(appliedDateRange)}
                  </Text>
                </View>
                <SearchFilterBar
                  searchQuery={searchQuery}
                  activeFilterCount={activeFilterCount}
                  onSearchChange={setSearchQuery}
                  onSearchSubmit={() => undefined}
                  onFilterPress={openFilterSheet}
                />
              </View>

              <FeatureBanner
                visible={isBannerVisible}
                onClose={() => setIsBannerVisible(false)}
              />

              <ApplicationsTabs
                activeTab={activeTab}
                counts={tabCounts}
                onTabChange={setActiveTab}
              />

              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-[22px] font-bold leading-7 text-app-text-4">
                  Applications History
                </Text>

                <View className="rounded-full border border-app-border-light bg-app-slate-gray px-3 py-1.5">
                  <Text className="text-[11px] font-semibold text-app-text-5">
                    {filteredApplications.length} results
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <ApplicationsEmptyState
              activeTab={activeTab}
              searchQuery={searchQuery}
            />
          }
        />

        <ApplicationsFilterSheet
          visible={filterVisible}
          dateRange={draftDateRange}
          currentPreset={activePreset}
          onPresetSelect={(preset) => {
            setActivePreset(preset);
            const nextRange = getDateRangeForPreset(preset);
            setDraftDateRange(toDateRangeInput(nextRange));
          }}
          onChangeDateRange={setDraftDateRange}
          onApply={applyDateRange}
          onClear={clearFilters}
          onClose={() => setFilterVisible(false)}
        />

        <CandidateDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath="/pages/candidate/dashboard"
        />
      </View>
    </>
  );
}