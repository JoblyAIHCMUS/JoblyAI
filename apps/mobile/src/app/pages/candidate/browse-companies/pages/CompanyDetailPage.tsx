import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Globe,
  CalendarDays,
  Users,
  MapPin,
  Briefcase,
  ExternalLink,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetCompany } from '../../../../hooks';
import { COLORS } from '../../../../constants/theme';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.getFullYear().toString();
}

export default function CompanyDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: company, loading, error, fetchCompany } = useGetCompany();

  useEffect(() => {
    if (id) {
      fetchCompany(Number(id));
    }
  }, [id, fetchCompany]);

  const handleGoBack = () => {
    router.back();
  };

  const handleVisitWebsite = () => {
    if (company?.websiteUrl) {
      Linking.openURL(company.websiteUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary2} />
          <Text className="mt-4 text-sm text-gray-500">
            Loading company profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !company) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-lg text-gray-900">
            {error?.message || 'Company not found'}
          </Text>
          <TouchableOpacity
            onPress={handleGoBack}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-3"
          >
            <Text className="font-semibold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = [
    {
      icon: CalendarDays,
      label: 'Founded',
      value: formatDate(company.createdAt),
    },
    {
      icon: Users,
      label: 'Employees',
      value: company.sizeRange || 'N/A',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Remote',
    },
    {
      icon: Briefcase,
      label: 'Industry',
      value: company.industry || 'Technology',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <TouchableOpacity
          onPress={handleGoBack}
          className="h-10 w-10 items-center justify-center"
        >
          <ArrowLeft size={24} color={COLORS.darkText} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="ml-2 flex-1 text-lg font-bold text-gray-900">
          Company Profile
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="bg-gray-50 px-4 py-6">
          <View className="flex-row items-start">
            {/* Company Logo */}
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              {company.logoUrl ? (
                <Image
                  source={{ uri: company.logoUrl }}
                  className="h-16 w-16"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-2xl font-bold text-gray-600">
                  {getInitials(company.name)}
                </Text>
              )}
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {company.name}
              </Text>
              {company.websiteUrl && (
                <TouchableOpacity
                  onPress={handleVisitWebsite}
                  className="mt-1 flex-row items-center"
                >
                  <Globe size={14} color="#4F46E5" />
                  <Text className="ml-1 text-sm text-indigo-600">
                    {company.websiteUrl}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats Grid */}
          <View className="mt-6 flex-row flex-wrap justify-between">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <View
                  key={stat.label}
                  className="mb-3 w-[48%] flex-row items-center rounded-lg bg-white p-3 shadow-sm"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-indigo-50">
                    <Icon size={16} color="#4F46E5" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-xs font-medium uppercase text-gray-400">
                      {stat.label}
                    </Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {stat.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Description Section */}
        <View className="px-4 py-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            About Company
          </Text>
          <Text className="text-base leading-6 text-gray-600">
            {company.description || 'No description available.'}
          </Text>
        </View>

        {/* Industry Tag */}
        {company.industry && (
          <View className="px-4 pb-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Industry
            </Text>
            <View className="self-start rounded-full bg-indigo-50 px-4 py-2">
              <Text className="text-sm font-medium text-indigo-700">
                {company.industry}
              </Text>
            </View>
          </View>
        )}

        {/* Website Button */}
        {company.websiteUrl && (
          <View className="px-4 pb-8">
            <TouchableOpacity
              onPress={handleVisitWebsite}
              className="flex-row items-center justify-center rounded-lg bg-indigo-600 py-4"
            >
              <ExternalLink size={18} color="white" />
              <Text className="ml-2 text-base font-semibold text-white">
                Visit Website
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
