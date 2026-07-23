'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { Menu } from 'lucide-react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useListJobs, useCategories, useSkillsFilter } from '@/hooks';
import { useUser } from '@/hooks/useUser';
import { useListCandidateApplications } from '@/hooks/useListCandidateApplications';
import { COLORS } from '@/app/constants/theme';
import JobCard from './components/JobCard';
import SearchBar from './components/SearchBar';
import SortDropdown from './components/SortDropdown';
import FilterPanel from './components/FilterPanel';
import type { ListJobsQuery, SortOption, EmploymentType } from '@/types/job';
import AppSidebar from '@/app/components/AppSidebar';
import { capFor } from './constants';
import type { SupportedCurrency } from './constants';

const PAGE_SIZE = 10;

const ACTIVE_APPLICATION_STATUSES = [
  'APPLIED',
  'PRE_SHORTLIST_PENDING',
  'PRE_SHORTLIST_SUBMITTED',
  'INTERVIEW',
  'OFFER',
] as const;

function FindJobsPage() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // State for search and filter
  const [urlPage, setUrlPage] = useState(1);
  const [urlSort, setUrlSort] = useState<SortOption>('MOST_RELEVANT');
  const [urlQ, setUrlQ] = useState('');
  const [urlLocation, setUrlLocation] = useState('');
  const [urlMinSalary, setUrlMinSalary] = useState(0);
  const [urlMaxSalary, setUrlMaxSalary] = useState(capFor(null));
  const [urlSalaryCurrency, setUrlSalaryCurrency] =
    useState<SupportedCurrency | null>(null);
  const [urlCategories, setUrlCategories] = useState<(number | string)[]>([]);
  const [urlTypes, setUrlTypes] = useState<EmploymentType[]>([]);
  const [urlSkills, setUrlSkills] = useState<string[]>([]);

  // Local input states for debouncing
  const [localSearchTerm, setLocalSearchTerm] = useState(urlQ);
  const [localLocation, setLocalLocation] = useState(urlLocation);
  const [localSalaryMin, setLocalSalaryMin] = useState(urlMinSalary);
  const [localSalaryMax, setLocalSalaryMax] = useState(urlMaxSalary);
  const [localSalaryCurrency, setLocalSalaryCurrency] =
    useState<SupportedCurrency | null>(urlSalaryCurrency);

  // Fetch jobs
  const { fetchJobs, data: jobsData, loading: loadingJobs } = useListJobs();
  const jobs = jobsData?.jobs || [];
  const total = jobsData?.total || 0;
  const totalPages = jobsData?.totalPages || 1;

  // Fetch categories
  const { categories } = useCategories();

  // Fetch skills
  const { fetchSkills } = useSkillsFilter();

  // Set of job IDs the candidate has an active application for. Drives the
  // "Applied" disabled state on each JobCard. Mirrors the web's
  // apps/web/src/features/find-jobs/page.tsx::appliedJobIds.
  const { data: user } = useUser();
  const { fetchApplications } = useListCandidateApplications();
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(
    () => new Set()
  );

  // Re-fetch on every focus (initial mount + returning from the detail page
  // after applying). This gives the snappy "the card flipped to Applied
  // without a manual refresh" UX without needing a callback plumbed back
  // from the detail page's apply modal.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadApplications = async () => {
        if (!user || user.role !== 'candidate') {
          if (active) setAppliedJobIds(new Set());
          return;
        }
        try {
          const res = await fetchApplications({ page: 1, pageSize: 100 });
          if (!active) return;
          const appliedIds = new Set<number>(
            (res.applications || [])
              .filter((a) =>
                (ACTIVE_APPLICATION_STATUSES as readonly string[]).includes(
                  a.status
                )
              )
              .map((a) => a.jobId)
          );
          setAppliedJobIds(appliedIds);
        } catch {
          // ignore errors — public browsing shows "Apply" for everything
        }
      };
      void loadApplications();
      return () => {
        active = false;
      };
    }, [user, fetchApplications])
  );

  useEffect(() => {
    fetchSkills(localSearchTerm);
  }, [localSearchTerm, fetchSkills]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== urlQ) {
        setUrlQ(localSearchTerm);
        setUrlPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm, urlQ]);

  // Debounce location
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localLocation !== urlLocation) {
        setUrlLocation(localLocation);
        setUrlPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localLocation, urlLocation]);

  // Debounce salary (min/max/currency together)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        localSalaryMin !== urlMinSalary ||
        localSalaryMax !== urlMaxSalary ||
        localSalaryCurrency !== urlSalaryCurrency
      ) {
        setUrlMinSalary(localSalaryMin);
        setUrlMaxSalary(localSalaryMax);
        setUrlSalaryCurrency(localSalaryCurrency);
        setUrlPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    localSalaryMin,
    localSalaryMax,
    localSalaryCurrency,
    urlMinSalary,
    urlMaxSalary,
    urlSalaryCurrency,
  ]);

  // Fetch jobs when filters change
  useEffect(() => {
    const selectedEmploymentTypes = urlTypes
      .map((type) => type)
      .filter((type): type is EmploymentType => type !== undefined);

    const query: ListJobsQuery = {
      page: urlPage,
      pageSize: PAGE_SIZE,
      sort: urlSort,
      q: urlQ || undefined,
      location: urlLocation || undefined,
      type:
        selectedEmploymentTypes.length > 0
          ? selectedEmploymentTypes
          : undefined,
      categories:
        urlCategories.length > 0
          ? urlCategories.map((c) => Number(c))
          : undefined,
      salaryMin: urlMinSalary > 0 ? urlMinSalary : undefined,
      salaryMax:
        urlMaxSalary < capFor(urlSalaryCurrency) ? urlMaxSalary : undefined,
      currency: urlSalaryCurrency ?? undefined,
      skills: urlSkills.length > 0 ? urlSkills : undefined,
    };

    fetchJobs(query);
  }, [
    urlPage,
    urlSort,
    urlQ,
    urlLocation,
    urlMinSalary,
    urlMaxSalary,
    urlSalaryCurrency,
    urlCategories,
    urlTypes,
    urlSkills,
    fetchJobs,
  ]);

  const handleSelectSort = (option: SortOption) => {
    setUrlSort(option);
    setUrlPage(1);
  };

  const handleSalaryChange = (min: number, max: number) => {
    setLocalSalaryMin(min);
    setLocalSalaryMax(max);
  };

  const handleSalaryApply = () => {
    setFilterPanelOpen(false);
  };

  const handleReset = () => {
    setLocalSearchTerm('');
    setLocalLocation('');
    setLocalSalaryMin(0);
    setLocalSalaryMax(capFor(null));
    setLocalSalaryCurrency(null);
    setUrlQ('');
    setUrlLocation('');
    setUrlMinSalary(0);
    setUrlMaxSalary(capFor(null));
    setUrlSalaryCurrency(null);
    setUrlCategories([]);
    setUrlTypes([]);
    setUrlSkills([]);
    setUrlSort('MOST_RELEVANT');
    setUrlPage(1);
  };

  const handlePageChange = (page: number) => {
    setUrlPage(page);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath="/pages/find-jobs"
      />

      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Top Bar */}
          <View className="flex-row items-center justify-between border-b border-app-gray-1 bg-white px-4 py-4">
            <TouchableOpacity
              onPress={() => setSidebarOpen(true)}
              className="h-10 w-10 items-center justify-center"
            >
              <Menu size={24} color={COLORS.darkText} strokeWidth={2} />
            </TouchableOpacity>
            <Text className="flex-1 ml-3 text-lg font-bold text-app-dark-text">
              Find Jobs
            </Text>
          </View>

          {/* Search Bar */}
          <SearchBar
            searchTerm={localSearchTerm}
            location={localLocation}
            onSearchTermChange={setLocalSearchTerm}
            onLocationChange={setLocalLocation}
          />

          {/* Filter and Sort Controls */}
          <View className="flex-row gap-2 px-4 py-3">
            <TouchableOpacity
              onPress={() => setFilterPanelOpen(true)}
              className="flex-1 rounded-lg border border-app-gray-1 bg-white px-4 py-3"
            >
              <Text className="text-center text-sm font-semibold text-app-dark-text">
                Filters
              </Text>
            </TouchableOpacity>
            <View className="flex-1">
              <SortDropdown
                selectedSort={urlSort}
                onSortChange={handleSelectSort}
              />
            </View>
          </View>

          {/* Results count */}
          <View className="px-4 py-2">
            <Text className="text-sm text-app-gray-3">{total} jobs found</Text>
          </View>

          {/* Jobs List */}
          {loadingJobs && jobs.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={COLORS.primary2} />
              <Text className="mt-4 text-sm text-app-gray-3">
                Loading jobs...
              </Text>
            </View>
          ) : jobs.length === 0 ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text className="text-center text-lg text-app-dark-text">
                No jobs found
              </Text>
              <TouchableOpacity
                onPress={handleReset}
                className="mt-4 rounded-lg bg-app-primary-2 px-6 py-3"
              >
                <Text className="font-semibold text-white">Reset Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <FlatList
              data={jobs}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View className="px-4">
                  <JobCard job={item} hasApplied={appliedJobIds.has(item.id)} />
                </View>
              )}
              contentContainerStyle={{
                paddingBottom: 16,
              }}
              scrollIndicatorInsets={{ right: 1 }}
              showsVerticalScrollIndicator={true}
              ListFooterComponent={
                loadingJobs ? (
                  <View className="py-4">
                    <ActivityIndicator size="small" color={COLORS.primary2} />
                  </View>
                ) : null
              }
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && jobs.length > 0 && (
            <View
              className="border-t border-app-gray-1 bg-white px-4 py-3"
              style={{ paddingBottom: 12 + insets.bottom }}
            >
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => handlePageChange(Math.max(1, urlPage - 1))}
                  disabled={urlPage === 1}
                  className={`rounded px-3 py-2 ${
                    urlPage === 1 ? 'bg-app-bg-disabled' : 'bg-app-primary-2'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urlPage === 1 ? 'text-app-text-placeholder' : 'text-white'
                    }`}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <TouchableOpacity
                        key={pageNum}
                        onPress={() => handlePageChange(pageNum)}
                        className={`rounded px-3 py-2 ${
                          urlPage === pageNum
                            ? 'bg-app-primary-2'
                            : 'bg-app-bg-disabled'
                        }`}
                      >
                        <Text
                          className={`font-semibold ${
                            urlPage === pageNum
                              ? 'text-white'
                              : 'text-app-gray-2'
                          }`}
                        >
                          {pageNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() =>
                    handlePageChange(Math.min(totalPages, urlPage + 1))
                  }
                  disabled={urlPage === totalPages}
                  className={`rounded px-3 py-2 ${
                    urlPage === totalPages
                      ? 'bg-app-bg-disabled'
                      : 'bg-app-primary-2'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urlPage === totalPages
                        ? 'text-app-text-placeholder'
                        : 'text-white'
                    }`}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Filter Panel Modal */}
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        categories={categories}
        salaryCurrency={localSalaryCurrency}
        salaryMin={localSalaryMin}
        salaryMax={localSalaryMax}
        onSalaryCurrencyChange={setLocalSalaryCurrency}
        onSalaryChange={handleSalaryChange}
        onSalaryApply={handleSalaryApply}
        selectedTypes={urlTypes}
        onTypeChange={(types) => {
          setUrlTypes(types);
          setUrlPage(1);
        }}
        selectedCategories={urlCategories}
        onCategoryChange={(categoryIds) => {
          setUrlCategories(categoryIds);
          setUrlPage(1);
        }}
        onReset={handleReset}
      />
    </>
  );
}

export default FindJobsPage;
