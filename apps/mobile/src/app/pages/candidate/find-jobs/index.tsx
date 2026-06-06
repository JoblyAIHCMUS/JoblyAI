'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Menu } from 'lucide-react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useListJobs, useCategories, useSkillsFilter } from '../../../../hooks';
import CandidateDashboardSidebar from '../dashboard/components/CandidateDashboardSidebar';
import JobCard from './components/JobCard';
import SearchBar from './components/SearchBar';
import SortDropdown from './components/SortDropdown';
import FilterPanel from './components/FilterPanel';
import type {
  ListJobsQuery,
  SortOption,
  EmploymentType,
} from '../../../../types/job';

const PAGE_SIZE = 10;
const SALARY_MAX_CAP = 500000;

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
  const [urlMaxSalary, setUrlMaxSalary] = useState(SALARY_MAX_CAP);
  const [urlCategories, setUrlCategories] = useState<(number | string)[]>([]);
  const [urlTypes, setUrlTypes] = useState<EmploymentType[]>([]);
  const [urlSkills, setUrlSkills] = useState<string[]>([]);

  // Local input states for debouncing
  const [localSearchTerm, setLocalSearchTerm] = useState(urlQ);
  const [localLocation, setLocalLocation] = useState(urlLocation);
  const [localSalaryMin, setLocalSalaryMin] = useState(urlMinSalary);
  const [localSalaryMax, setLocalSalaryMax] = useState(urlMaxSalary);

  // Fetch jobs
  const { fetchJobs, data: jobsData, loading: loadingJobs } = useListJobs();
  const jobs = jobsData?.jobs || [];
  const total = jobsData?.total || 0;
  const totalPages = jobsData?.totalPages || 1;

  // Fetch categories
  const { categories } = useCategories();

  // Fetch skills
  const { fetchSkills } = useSkillsFilter();

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

  // Debounce salary
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSalaryMin !== urlMinSalary || localSalaryMax !== urlMaxSalary) {
        setUrlMinSalary(localSalaryMin);
        setUrlMaxSalary(localSalaryMax);
        setUrlPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSalaryMin, localSalaryMax, urlMinSalary, urlMaxSalary]);

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
      salaryMax: urlMaxSalary < SALARY_MAX_CAP ? urlMaxSalary : undefined,
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

  const handleReset = () => {
    setLocalSearchTerm('');
    setLocalLocation('');
    setLocalSalaryMin(0);
    setLocalSalaryMax(SALARY_MAX_CAP);
    setUrlQ('');
    setUrlLocation('');
    setUrlMinSalary(0);
    setUrlMaxSalary(SALARY_MAX_CAP);
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

      <SafeAreaView className="flex-1 bg-white">
        <CandidateDashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <View className="flex-1">
          {/* Top Bar */}
          <View className="flex-row items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-4">
            <TouchableOpacity
              onPress={() => setSidebarOpen(true)}
              className="h-10 w-10 items-center justify-center"
            >
              <Menu size={24} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
            <Text className="flex-1 ml-3 text-lg font-bold text-[#111827]">
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
              className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3"
            >
              <Text className="text-center text-sm font-semibold text-[#111827]">
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
            <Text className="text-sm text-[#6b7280]">{total} jobs found</Text>
          </View>

          {/* Jobs List */}
          {loadingJobs && jobs.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-4 text-sm text-[#6b7280]">
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
              <Text className="text-center text-lg text-[#111827]">
                No jobs found
              </Text>
              <TouchableOpacity
                onPress={handleReset}
                className="mt-4 rounded-lg bg-[#4f46e5] px-6 py-3"
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
                  <JobCard job={item} />
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
                    <ActivityIndicator size="small" color="#4f46e5" />
                  </View>
                ) : null
              }
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && jobs.length > 0 && (
            <View
              className="border-t border-[#e5e7eb] bg-white px-4 py-3"
              style={{ paddingBottom: 12 + insets.bottom }}
            >
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => handlePageChange(Math.max(1, urlPage - 1))}
                  disabled={urlPage === 1}
                  className={`rounded px-3 py-2 ${
                    urlPage === 1 ? 'bg-[#f3f4f6]' : 'bg-[#4f46e5]'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urlPage === 1 ? 'text-[#9ca3af]' : 'text-white'
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
                          urlPage === pageNum ? 'bg-[#4f46e5]' : 'bg-[#f3f4f6]'
                        }`}
                      >
                        <Text
                          className={`font-semibold ${
                            urlPage === pageNum
                              ? 'text-white'
                              : 'text-[#374151]'
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
                    urlPage === totalPages ? 'bg-[#f3f4f6]' : 'bg-[#4f46e5]'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      urlPage === totalPages ? 'text-[#9ca3af]' : 'text-white'
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
        salaryMin={localSalaryMin}
        salaryMax={localSalaryMax}
        onSalaryChange={handleSalaryChange}
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
