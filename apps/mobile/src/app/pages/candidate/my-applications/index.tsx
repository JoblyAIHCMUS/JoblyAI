import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { Stack } from 'expo-router';

import { ApplicationsEmptyState } from './components/ApplicationsEmptyState';
import { ApplicationsFilterSheet } from './components/ApplicationsFilterSheet';
import { ApplicationsTabs } from './components/ApplicationsTabs';
import { ApplicationCard } from './components/ApplicationCard';
import { FeatureBanner } from './components/FeatureBanner';
import { SearchFilterBar } from './components/SearchFilterBar';
import CandidateDashboardSidebar from '@/app/components/CandidateDashboardSidebar';
import { Text } from '@/components/ui/text';

import { useListCandidateApplications } from '../../../../hooks/useListCandidateApplications';
import type { CandidateApplicationRecord } from '../../../../types/application';
import type { ApplicationItem, DatePreset } from '../dashboard/types';
import {
  createDefaultDateRange,
  formatDateRangeLabel,
  getDateRangeForPreset,
  isWithinDateRange,
  parseDateInput,
  toDateRangeInput,
} from '../dashboard/utils';
import { getGreetingName, useUser } from '../../../../hooks/useUser';
import { useGetCandidateProfile } from '../../../../hooks/useGetCandidateProfile';
import { CandidateHeader } from '@/components/header/CandidateHeader';

type ApplicationFilterTab = 'ALL' | 'ACTIVE' | 'CLOSED';

const FILTER_TABS: Array<{ key: ApplicationFilterTab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'In Review' },
  { key: 'CLOSED', label: 'Closed' },
];

const ACTIVE_STATUSES = new Set(['APPLIED', 'INTERVIEW']);
const CLOSED_STATUSES = new Set(['OFFER', 'REJECTED', 'WITHDRAWN']);

function mapApplicationRecord(
  record: CandidateApplicationRecord
): ApplicationItem {
  return {
    id: String(record.id),
    title: record.job.title,
    company: record.job.companyName ?? 'Unknown company',
    location: record.job.location ?? (record.job.remote ? 'Remote' : 'Unknown'),
    appliedAt: new Date(record.createdAt),
    status: record.status,
    logoUrl: record.job.companyLogoUrl ?? undefined,
  };
}

export default function MyApplicationsPage() {
  const { data: user } = useUser();
  const { data: profile } = useGetCandidateProfile();
  const firstName =
    profile?.firstName ||
    profile?.name?.split(' ')[0] ||
    getGreetingName(user) ||
    'there';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [activeFilterTab, setActiveFilterTab] =
    useState<ApplicationFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activePreset, setActivePreset] = useState<DatePreset>('LAST_7_DAYS');
  const [appliedDateRange, setAppliedDateRange] = useState(
    createDefaultDateRange()
  );
  const [draftDateRange, setDraftDateRange] = useState(
    toDateRangeInput(createDefaultDateRange())
  );

  const [draftCompany, setDraftCompany] = useState('');
  const [draftJobType, setDraftJobType] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [appliedCompany, setAppliedCompany] = useState('');
  const [appliedJobType, setAppliedJobType] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');

  const { fetchApplications, loading, error } = useListCandidateApplications();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchApplications();
        if (!cancelled && result) {
          setApplications(result.applications.map(mapApplicationRecord));
        }
      } catch {
        if (!cancelled) {
          setApplications([]);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchApplications, refreshKey]);

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
      ? 'Good afternoon'
      : 'Good evening';

  const companyOptions = useMemo(() => {
    const set = new Set(applications.map((a) => a.company));
    return Array.from(set).sort();
  }, [applications]);

  const jobTypeOptions = useMemo(() => {
    const set = new Set(
      applications
        .map((a) => {
          const status = a.status;
          return status;
        })
        .filter(Boolean)
    );
    return Array.from(set).sort();
  }, [applications]);

  const locationOptions = useMemo(() => {
    const set = new Set(applications.map((a) => a.location).filter(Boolean));
    return Array.from(set).sort();
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesDate = isWithinDateRange(
        application.appliedAt,
        appliedDateRange
      );

      let matchesTab = true;
      if (activeFilterTab === 'ACTIVE') {
        matchesTab = ACTIVE_STATUSES.has(application.status);
      } else if (activeFilterTab === 'CLOSED') {
        matchesTab = CLOSED_STATUSES.has(application.status);
      }

      const matchesSearch = normalizedQuery
        ? [application.title, application.company, application.location]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)
        : true;

      const matchesCompany = appliedCompany
        ? application.company
            .toLowerCase()
            .includes(appliedCompany.toLowerCase())
        : true;

      const matchesLocation = appliedLocation
        ? application.location
            .toLowerCase()
            .includes(appliedLocation.toLowerCase())
        : true;

      return (
        matchesDate &&
        matchesTab &&
        matchesSearch &&
        matchesCompany &&
        matchesLocation
      );
    });
  }, [
    activeFilterTab,
    appliedDateRange,
    appliedCompany,
    appliedLocation,
    searchQuery,
    applications,
  ]);

  const tabCounts = useMemo(() => {
    const dateFiltered = applications.filter((application) =>
      isWithinDateRange(application.appliedAt, appliedDateRange)
    );

    return {
      ALL: dateFiltered.length,
      ACTIVE: dateFiltered.filter((a) => ACTIVE_STATUSES.has(a.status)).length,
      CLOSED: dateFiltered.filter((a) => CLOSED_STATUSES.has(a.status)).length,
    };
  }, [appliedDateRange, applications]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilterTab !== 'ALL') count += 1;
    if (searchQuery.trim().length > 0) count += 1;
    if (activePreset !== 'LAST_7_DAYS') count += 1;
    if (appliedCompany) count += 1;
    if (appliedLocation) count += 1;
    return count;
  }, [
    activeFilterTab,
    activePreset,
    appliedCompany,
    appliedLocation,
    searchQuery,
  ]);

  const openFilterSheet = useCallback(() => {
    setDraftDateRange(toDateRangeInput(appliedDateRange));
    setDraftCompany(appliedCompany);
    setDraftJobType(appliedJobType);
    setDraftLocation(appliedLocation);
    setFilterVisible(true);
  }, [appliedCompany, appliedDateRange, appliedJobType, appliedLocation]);

  const applyFilters = useCallback(() => {
    const parsedFrom = parseDateInput(draftDateRange.from);
    const parsedTo = parseDateInput(draftDateRange.to);

    if (parsedFrom && parsedTo) {
      setAppliedDateRange({ from: parsedFrom, to: parsedTo });
    }

    setAppliedCompany(draftCompany);
    setAppliedJobType(draftJobType);
    setAppliedLocation(draftLocation);
    setFilterVisible(false);
  }, [
    draftCompany,
    draftDateRange.from,
    draftDateRange.to,
    draftJobType,
    draftLocation,
  ]);

  const clearFilters = useCallback(() => {
    const defaultRange = createDefaultDateRange();
    setAppliedDateRange(defaultRange);
    setDraftDateRange(toDateRangeInput(defaultRange));
    setActivePreset('LAST_7_DAYS');
    setActiveFilterTab('ALL');
    setSearchQuery('');
    setAppliedCompany('');
    setAppliedJobType('');
    setAppliedLocation('');
    setDraftCompany('');
    setDraftJobType('');
    setDraftLocation('');
    setFilterVisible(false);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-app-background-2">
        <CandidateHeader
          title="Applications"
          initials={(profile?.firstName || 'U').slice(0, 2).toUpperCase()}
          onMenuPress={() => setIsSidebarOpen(true)}
        />
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ApplicationCard
              application={item}
              onWithdrawn={() => setRefreshKey((k) => k + 1)}
            />
          )}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => setRefreshKey((k) => k + 1)}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
          ListHeaderComponent={
            <View className="gap-4 py-4">
              <View className="gap-2">
                <Text className="text-[28px] font-bold leading-8 text-app-text-4">
                  {greeting}, {firstName}
                </Text>
                <Text className="text-[15px] leading-6 text-app-text-5">
                  Here&apos;s the status of your applications from{' '}
                  {formatDateRangeLabel(appliedDateRange)}.
                </Text>
              </View>

              <FeatureBanner
                visible={isBannerVisible}
                onClose={() => setIsBannerVisible(false)}
              />

              <SearchFilterBar
                searchQuery={searchQuery}
                activeFilterCount={activeFilterCount}
                onSearchChange={setSearchQuery}
                onSearchSubmit={() => undefined}
                onFilterPress={openFilterSheet}
              />

              <ApplicationsTabs
                activeTab={activeFilterTab}
                counts={tabCounts}
                onTabChange={setActiveFilterTab}
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
            loading ? (
              <View className="items-center py-12">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="mt-3 text-sm text-app-text-5">
                  Loading applications...
                </Text>
              </View>
            ) : error ? (
              <View className="items-center py-12">
                <Text className="text-sm text-app-red-2">
                  Failed to load applications. Please try again.
                </Text>
              </View>
            ) : (
              <ApplicationsEmptyState
                activeTab={
                  activeFilterTab === 'ACTIVE'
                    ? 'APPLIED'
                    : activeFilterTab === 'CLOSED'
                    ? 'REJECTED'
                    : 'ALL'
                }
                searchQuery={searchQuery}
              />
            )
          }
        />

        <ApplicationsFilterSheet
          visible={filterVisible}
          dateRange={draftDateRange}
          currentPreset={activePreset}
          company={draftCompany}
          jobType={draftJobType}
          location={draftLocation}
          companyOptions={companyOptions}
          jobTypeOptions={jobTypeOptions}
          locationOptions={locationOptions}
          onCompanyChange={setDraftCompany}
          onJobTypeChange={setDraftJobType}
          onLocationChange={setDraftLocation}
          onPresetSelect={(preset) => {
            setActivePreset(preset);
            const nextRange = getDateRangeForPreset(preset);
            setDraftDateRange(toDateRangeInput(nextRange));
          }}
          onChangeDateRange={setDraftDateRange}
          onApply={applyFilters}
          onClear={clearFilters}
          onClose={() => setFilterVisible(false)}
        />

        <CandidateDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath="/pages/candidate/dashboard/my-applications"
        />
      </View>
    </>
  );
}
