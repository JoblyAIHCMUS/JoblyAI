import { useEffect, useMemo, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Building2, MapPin, Menu, Search } from 'lucide-react-native';

import { useCompanies } from '@/hooks';
import type { Company } from '@/types/company';
import { COLORS } from '@/app/constants/theme';
import AppSidebar from '@/app/components/AppSidebar';

const POPULAR_SEARCHES = ['Design', 'Engineering', 'Marketing', 'Finance'];
const PAGE_SIZE = 6;
const COMPANY_SIZE_FILTERS = [
  'All',
  'Startup',
  'Small',
  'Medium',
  'Large',
] as const;

type CompanySizeFilter = (typeof COMPANY_SIZE_FILTERS)[number];

const COMPANY_SIZE_RANGE_MAP: Record<
  Exclude<CompanySizeFilter, 'All'>,
  string[]
> = {
  Startup: ['1-10', '1-50'],
  Small: ['11-50', '51-200'],
  Medium: ['201-500', '501-1000'],
  Large: ['1000+', '1001+'],
};

function getCompanyInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}

function getIndustry(company: Company): string {
  return company.industry?.trim() || 'Technology';
}

function getShortDescription(company: Company): string {
  const description = company.description?.trim();

  if (description) {
    return description;
  }

  const industry = getIndustry(company).toLowerCase();
  return `${company.name} is a ${industry} company with active opportunities for candidates.`;
}

function CompanyLogo({ company }: { company: Company }) {
  const initials = getCompanyInitials(company.name) || 'J';

  if (company.logoUrl) {
    return (
      <Image
        source={{ uri: company.logoUrl }}
        className="h-16 w-16 rounded-xl border border-app-slate-2 bg-app-white-1"
        resizeMode="contain"
      />
    );
  }

  return (
    <View className="h-16 w-16 items-center justify-center rounded-xl bg-app-bg-selected">
      <Text className="text-lg font-bold text-app-primary-1">{initials}</Text>
    </View>
  );
}

function CompanyCard({
  company,
  onPress,
}: {
  company: Company;
  onPress?: () => void;
}) {
  const industry = getIndustry(company);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="rounded-[10px] border border-app-border-1 bg-app-white-1 p-5"
      onPress={onPress}
    >
      <View className="mb-4 flex-row items-start justify-between gap-4">
        <CompanyLogo company={company} />
        <View className="rounded-sm bg-app-bg-selected px-3 py-1">
          <Text className="text-sm text-app-primary-1">View</Text>
        </View>
      </View>

      <Text className="mb-3 text-2xl font-semibold leading-7 text-app-slate-1">
        {company.name}
      </Text>

      <Text
        className="mb-4 text-base leading-6 text-app-text-5"
        numberOfLines={4}
      >
        {getShortDescription(company)}
      </Text>

      <View className="flex-row flex-wrap items-center gap-3">
        <View className="rounded-sm border border-app-amber-1 px-3 py-1">
          <Text className="text-sm font-semibold text-app-amber-1">
            {industry}
          </Text>
        </View>

        {company.sizeRange ? (
          <View className="rounded-sm bg-app-background-1 px-3 py-1">
            <Text className="text-sm font-semibold text-app-primary-2">
              {company.sizeRange}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function BrowseCompaniesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localLocation, setLocalLocation] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [selectedCompanySize, setSelectedCompanySize] =
    useState<CompanySizeFilter>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const sizeRange = useMemo<string[] | undefined>(() => {
    if (selectedCompanySize === 'All') return undefined;
    return COMPANY_SIZE_RANGE_MAP[selectedCompanySize];
  }, [selectedCompanySize]);

  const { companies, total, totalPages, loading, error, refetch } =
    useCompanies({
      page: currentPage,
      pageSize: PAGE_SIZE,
      q: appliedSearchTerm.trim() || undefined,
      location: appliedLocation.trim() || undefined,
      sizeRange,
    });

  useEffect(
    () => setCurrentPage(1),
    [appliedLocation, appliedSearchTerm, selectedCompanySize]
  );

  const handleSearch = () => {
    setAppliedSearchTerm(localSearchTerm);
    setAppliedLocation(localLocation);
    setCurrentPage(1);
  };

  const handlePopularSearch = (value: string) => {
    setLocalSearchTerm(value);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveSearch =
    appliedSearchTerm.trim().length > 0 || appliedLocation.trim().length > 0;
  const companiesSectionTitle = hasActiveSearch
    ? 'Search Results'
    : 'Recommended Companies';
  const companiesSectionDescription = hasActiveSearch
    ? 'Companies matching your search keywords and location'
    : 'Based on your profile, company preferences, and recent activity';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath="/pages/browse-companies"
      />
      <SafeAreaView
        className="flex-1 bg-app-white-1"
        edges={['top', 'left', 'right']}
      >
        <View className="border-b border-app-border-1 bg-app-white-1 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              activeOpacity={0.7}
              className="h-10 w-10 items-center justify-center"
              onPress={() => setSidebarOpen(true)}
            >
              <Menu size={24} color={COLORS.textStrong} />
            </TouchableOpacity>

            <Text className="flex-1 pl-3 text-lg font-bold text-app-text-4">
              Browse Companies
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View
            className="px-4 pb-10 pt-8"
            style={{ backgroundColor: COLORS.surfaceSoft }}
          >
            <View className="rounded-[5px] bg-app-white-1 p-4 shadow-sm">
              <View className="flex-row items-center gap-4 px-1">
                <Search size={22} color={COLORS.brandDark} />
                <View className="flex-1 pt-2">
                  <TextInput
                    value={localSearchTerm}
                    onChangeText={setLocalSearchTerm}
                    placeholder="Company name or keyword"
                    placeholderTextColor={COLORS.slate400}
                    className="p-0 text-base text-app-slate-1"
                    returnKeyType="search"
                  />
                  <View className="mt-2 h-px bg-app-border-2" />
                </View>
              </View>

              <View className="mt-4 flex-row items-center gap-4 px-1">
                <MapPin size={22} color={COLORS.brandDark} />
                <View className="flex-1 pt-2">
                  <TextInput
                    value={localLocation}
                    onChangeText={setLocalLocation}
                    placeholder="Location"
                    placeholderTextColor={COLORS.slate400}
                    className="p-0 text-base text-app-slate-1"
                    returnKeyType="search"
                  />
                  <View className="mt-2 h-px bg-app-border-2" />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                className="mt-5 h-12 items-center justify-center rounded-[5px] bg-app-primary-2"
                onPress={handleSearch}
              >
                <Text className="text-base font-semibold text-white">
                  Search
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-center gap-1">
              <Text className="text-base leading-6 text-app-text-5">
                Popular :
              </Text>
              {POPULAR_SEARCHES.map((value) => (
                <TouchableOpacity
                  key={value}
                  activeOpacity={0.7}
                  onPress={() => handlePopularSearch(value)}
                >
                  <Text className="text-base leading-6 text-app-text-5">
                    {value}
                    {value === POPULAR_SEARCHES[POPULAR_SEARCHES.length - 1]
                      ? ''
                      : ','}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-app-white-1 px-4 py-10">
            <Text className="text-3xl font-semibold leading-9 text-app-slate-1">
              {companiesSectionTitle}
            </Text>
            <Text className="mt-2 text-base leading-6 text-app-text-5">
              {companiesSectionDescription}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-4 mt-6"
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {COMPANY_SIZE_FILTERS.map((companySize) => {
                const active = selectedCompanySize === companySize;

                return (
                  <TouchableOpacity
                    key={companySize}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCompanySize(companySize)}
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-app-primary-2 bg-app-bg-selected'
                        : 'border-app-border-1 bg-app-white-1'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        active ? 'text-app-primary-2' : 'text-app-text-5'
                      }`}
                    >
                      {companySize}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="mt-6 flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-app-bg-selected">
                <Building2 size={20} color={COLORS.primary2} />
              </View>
              <Text className="text-2xl font-semibold text-app-slate-1">
                {total} Results
              </Text>
            </View>

            {loading && companies.length === 0 ? (
              <View className="items-center py-12">
                <ActivityIndicator size="large" color={COLORS.primary2} />
                <Text className="mt-4 text-sm text-app-text-5">
                  Loading companies...
                </Text>
              </View>
            ) : error ? (
              <View className="mt-6 rounded-lg bg-app-tag-red-bg px-4 py-8">
                <Text className="text-center text-sm text-app-tag-red-text">
                  Unable to load companies. Pull to refresh.
                </Text>
              </View>
            ) : companies.length === 0 ? (
              <View className="mt-6 rounded-lg bg-app-bg-input px-4 py-8">
                <Text className="text-center text-base text-app-text-5">
                  {hasActiveSearch
                    ? 'No companies match your search.'
                    : 'No companies match your filters.'}
                </Text>
              </View>
            ) : (
              <View className="mt-6 gap-6">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onPress={() =>
                      router.push({
                        pathname: '/pages/browse-companies/[id]',
                        params: {
                          id: company.id.toString(),
                        },
                      })
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {totalPages > 1 && companies.length > 0 ? (
          <View
            className="border-t border-app-gray-1 bg-app-white-1 px-4 py-3"
            style={{ paddingBottom: 12 + insets.bottom }}
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`rounded px-3 py-2 ${
                  currentPage === 1 ? 'bg-app-bg-disabled' : 'bg-app-primary-2'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    currentPage === 1
                      ? 'text-app-text-placeholder'
                      : 'text-white'
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
                        currentPage === pageNum
                          ? 'bg-app-primary-2'
                          : 'bg-app-bg-disabled'
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          currentPage === pageNum
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
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`rounded px-3 py-2 ${
                  currentPage === totalPages
                    ? 'bg-app-bg-disabled'
                    : 'bg-app-primary-2'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    currentPage === totalPages
                      ? 'text-app-text-placeholder'
                      : 'text-white'
                  }`}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </>
  );
}
