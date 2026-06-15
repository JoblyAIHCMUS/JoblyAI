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

import { useCompanies } from '../../../../hooks';
import type { Company } from '../../../../types/company';
import { COLORS } from '../../../constants/theme';
import CandidateDashboardSidebar from '../dashboard/components/CandidateDashboardSidebar';

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

function normalizeSizeRange(sizeRange: string): string {
  return sizeRange.replace(/\s+/g, '').replace(/,/g, '');
}

function getCompanySizeGroup(company: Company): CompanySizeFilter | null {
  const normalizedSizeRange = normalizeSizeRange(company.sizeRange ?? '');

  if (!normalizedSizeRange) {
    return null;
  }

  const explicitGroup = (
    Object.entries(COMPANY_SIZE_RANGE_MAP) as Array<
      [Exclude<CompanySizeFilter, 'All'>, string[]]
    >
  ).find(([, ranges]) => ranges.includes(normalizedSizeRange))?.[0];

  if (explicitGroup) {
    return explicitGroup;
  }

  const rangeMatch = normalizedSizeRange.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, minValue, maxValue] = rangeMatch;
    const min = Number(minValue);
    const max = Number(maxValue);

    if (min >= 1 && max <= 50) {
      return 'Startup';
    }

    if (min >= 11 && max <= 200) {
      return 'Small';
    }

    if (min >= 201 && max <= 1000) {
      return 'Medium';
    }

    if (min >= 1000) {
      return 'Large';
    }
  }

  const plusMatch = normalizedSizeRange.match(/^(\d+)\+$/);
  if (plusMatch && Number(plusMatch[1]) >= 1000) {
    return 'Large';
  }

  return null;
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
        className="h-16 w-16 rounded-xl border border-[#e2e8f0] bg-app-white-1"
        resizeMode="contain"
      />
    );
  }

  return (
    <View className="h-16 w-16 items-center justify-center rounded-xl bg-[#eef0ff]">
      <Text className="text-lg font-bold text-[#4640de]">{initials}</Text>
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
        <View className="rounded-sm bg-[#eef0ff] px-3 py-1">
          <Text className="text-sm text-[#4640de]">View</Text>
        </View>
      </View>

      <Text className="mb-3 text-2xl font-semibold leading-7 text-[#0f172a]">
        {company.name}
      </Text>

      <Text
        className="mb-4 text-base leading-6 text-[#64748b]"
        numberOfLines={4}
      >
        {getShortDescription(company)}
      </Text>

      <View className="flex-row flex-wrap items-center gap-3">
        <View className="rounded-sm border border-[#ffb836] px-3 py-1">
          <Text className="text-sm font-semibold text-[#ffb836]">
            {industry}
          </Text>
        </View>

        {company.sizeRange ? (
          <View className="rounded-sm bg-[#eef2ff] px-3 py-1">
            <Text className="text-sm font-semibold text-[#4f46e5]">
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
  const { companies, loading, error, refetch } = useCompanies();

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = appliedSearchTerm.trim().toLowerCase();
    const normalizedLocation = appliedLocation.trim().toLowerCase();

    return companies.filter((company) => {
      const industry = getIndustry(company);
      const matchesCompanySize =
        selectedCompanySize === 'All' ||
        getCompanySizeGroup(company) === selectedCompanySize;
      const searchableText = [
        company.name,
        industry,
        company.description ?? '',
        company.websiteUrl ?? '',
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesLocation =
        !normalizedLocation || searchableText.includes(normalizedLocation);

      return matchesCompanySize && matchesSearch && matchesLocation;
    });
  }, [appliedLocation, appliedSearchTerm, companies, selectedCompanySize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / PAGE_SIZE)
  );

  const visibleCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCompanies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredCompanies]);

  useEffect(
    () => setCurrentPage(1),
    [appliedLocation, appliedSearchTerm, selectedCompanySize]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    <SafeAreaView className="flex-1 bg-app-white-1" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <CandidateDashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath="/pages/candidate/browse-companies"
      />

      <View className="border-b border-app-border-1 bg-app-white-1 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
            onPress={() => setSidebarOpen(true)}
          >
            <Menu size={24} color="#25324b" />
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
        <View className="bg-[#f8f8fd] px-4 pb-10 pt-8">
          <View className="rounded-[5px] bg-app-white-1 p-4 shadow-sm">
            <View className="flex-row items-center gap-4 px-1">
              <Search size={22} color="#0f172a" />
              <View className="flex-1 pt-2">
                <TextInput
                  value={localSearchTerm}
                  onChangeText={setLocalSearchTerm}
                  placeholder="Company name or keyword"
                  placeholderTextColor="#94a3b8"
                  className="p-0 text-base text-[#0f172a]"
                  returnKeyType="search"
                />
                <View className="mt-2 h-px bg-[#cbd5e1]" />
              </View>
            </View>

            <View className="mt-4 flex-row items-center gap-4 px-1">
              <MapPin size={22} color="#0f172a" />
              <View className="flex-1 pt-2">
                <TextInput
                  value={localLocation}
                  onChangeText={setLocalLocation}
                  placeholder="Location"
                  placeholderTextColor="#94a3b8"
                  className="p-0 text-base text-[#0f172a]"
                  returnKeyType="search"
                />
                <View className="mt-2 h-px bg-[#cbd5e1]" />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              className="mt-5 h-12 items-center justify-center rounded-[5px] bg-[#4f46e5]"
              onPress={handleSearch}
            >
              <Text className="text-base font-semibold text-white">Search</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4 flex-row flex-wrap justify-center gap-1">
            <Text className="text-base leading-6 text-[#64748b]">
              Popular :
            </Text>
            {POPULAR_SEARCHES.map((value) => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.7}
                onPress={() => handlePopularSearch(value)}
              >
                <Text className="text-base leading-6 text-[#64748b]">
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
          <Text className="text-3xl font-semibold leading-9 text-[#0f172a]">
            {companiesSectionTitle}
          </Text>
          <Text className="mt-2 text-base leading-6 text-[#64748b]">
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
                      ? 'border-[#4f46e5] bg-[#eef0ff]'
                      : 'border-app-border-1 bg-app-white-1'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? 'text-[#4f46e5]' : 'text-[#64748b]'
                    }`}
                  >
                    {companySize}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="mt-6 flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#eef0ff]">
              <Building2 size={20} color="#4f46e5" />
            </View>
            <Text className="text-2xl font-semibold text-[#0f172a]">
              {filteredCompanies.length} Results
            </Text>
          </View>

          {loading && companies.length === 0 ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={COLORS.primary2} />
              <Text className="mt-4 text-sm text-[#64748b]">
                Loading companies...
              </Text>
            </View>
          ) : error ? (
            <View className="mt-6 rounded-lg bg-[#fff1f0] px-4 py-8">
              <Text className="text-center text-sm text-[#dc2626]">
                Unable to load companies. Pull to refresh.
              </Text>
            </View>
          ) : visibleCompanies.length === 0 ? (
            <View className="mt-6 rounded-lg bg-[#f8fafc] px-4 py-8">
              <Text className="text-center text-base text-[#64748b]">
                {hasActiveSearch
                  ? 'No companies match your search.'
                  : 'No companies match your filters.'}
              </Text>
            </View>
          ) : (
            <View className="mt-6 gap-6">
              {visibleCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onPress={() =>
                    router.push({
                      pathname: '/pages/candidate/company-profile/[id]',
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

      {totalPages > 1 && visibleCompanies.length > 0 ? (
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
                  currentPage === 1 ? 'text-app-text-placeholder' : 'text-white'
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
  );
}
