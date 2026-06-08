import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Menu, Search, MapPin, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CandidateDashboardSidebar from '../dashboard/components/CandidateDashboardSidebar';
import CompanyCard from './components/CompanyCard';
import { useRecommendedCompanies } from '../../../../hooks';
import { COLORS } from '../../../constants/theme';

const POPULAR_TAGS = ['UI Designer', 'UX Researcher', 'Android', 'Admin'];

export default function BrowseCompaniesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const {
    companies,
    loading,
    error,
    refetch,
  } = useRecommendedCompanies(12);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        !searchTerm ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
        !locationFilter ||
        company.tag.label.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });
  }, [companies, searchTerm, locationFilter]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setLocationFilter('');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView className="flex-1 bg-white">
        <CandidateDashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
            <TouchableOpacity
              onPress={() => setSidebarOpen(true)}
              className="h-10 w-10 items-center justify-center"
            >
              <Menu size={24} color={COLORS.darkText} strokeWidth={2} />
            </TouchableOpacity>
            <Text className="ml-3 flex-1 text-lg font-bold text-gray-900">
              Browse Companies
            </Text>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <Text className="text-sm font-bold text-indigo-600">DH</Text>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Search Card */}
            <View className="mx-4 mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              {/* Company Name Input */}
              <View className="mb-3 flex-row items-center border-b border-gray-200 pb-3">
                <Search size={20} color={COLORS.darkText} strokeWidth={2} />
                <TextInput
                  className="ml-3 flex-1 text-base text-gray-900"
                  placeholder="nvidia"
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
                {searchTerm ? (
                  <TouchableOpacity onPress={() => setSearchTerm('')}>
                    <X size={18} color={COLORS.textPlaceholder} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Location Input */}
              <View className="mb-4 flex-row items-center border-b border-gray-200 pb-3">
                <MapPin size={20} color={COLORS.darkText} strokeWidth={2} />
                <TextInput
                  className="ml-3 flex-1 text-base text-gray-900"
                  placeholder="saigon"
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={locationFilter}
                  onChangeText={setLocationFilter}
                />
                {locationFilter ? (
                  <TouchableOpacity onPress={() => setLocationFilter('')}>
                    <X size={18} color={COLORS.textPlaceholder} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Search Button */}
              <TouchableOpacity
                onPress={handleClearSearch}
                className="items-center rounded-lg bg-indigo-600 py-3"
              >
                <Text className="text-base font-semibold text-white">
                  Search
                </Text>
              </TouchableOpacity>
            </View>

            {/* Popular Tags */}
            <View className="px-4 py-3">
              <Text className="text-center text-sm text-gray-500">
                Popular : {POPULAR_TAGS.join(', ')}
              </Text>
            </View>

            {/* Recommended Companies Section */}
            <View className="px-4 pb-4">
              <Text className="mb-2 text-2xl font-bold text-gray-900">
                Recommended Companies
              </Text>
              <Text className="mb-4 text-sm text-gray-500">
                Based on your profile, company preferences, and recent activity
              </Text>

              {/* Content */}
              {loading ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" color={COLORS.primary2} />
                  <Text className="mt-4 text-sm text-gray-500">
                    Loading companies...
                  </Text>
                </View>
              ) : error ? (
                <View className="items-center py-12">
                  <Text className="text-center text-sm text-red-500">
                    {error.message}
                  </Text>
                  <TouchableOpacity
                    onPress={refetch}
                    className="mt-4 rounded-lg bg-indigo-600 px-6 py-3"
                  >
                    <Text className="font-semibold text-white">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredCompanies.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-center text-lg text-gray-900">
                    No companies found
                  </Text>
                  <TouchableOpacity
                    onPress={handleClearSearch}
                    className="mt-4 rounded-lg bg-indigo-600 px-6 py-3"
                  >
                    <Text className="font-semibold text-white">
                      Clear Filters
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row flex-wrap justify-between">
                  {filteredCompanies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
