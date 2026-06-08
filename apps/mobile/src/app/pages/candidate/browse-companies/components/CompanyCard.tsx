import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { router } from 'expo-router';
import type { RecommendedCompany } from '../../../../../api/company';

interface CompanyCardProps {
  company: RecommendedCompany;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function CompanyCard({ company }: CompanyCardProps) {
  const handlePress = () => {
    router.push(`/pages/candidate/browse-companies/${company.id}` as never);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className="mb-4 w-[48%] overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      <View className="p-4">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {company.logo.imageUrl ? (
              <Image
                source={{ uri: company.logo.imageUrl }}
                className="h-12 w-12"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-lg font-bold text-gray-600">
                {getInitials(company.name)}
              </Text>
            )}
          </View>
          <View className="flex-row items-center rounded-full bg-indigo-50 px-2 py-1">
            <Briefcase size={12} color="#4F46E5" />
            <Text className="ml-1 text-xs font-semibold text-indigo-700">
              {company.jobs}
            </Text>
          </View>
        </View>

        <Text
          className="mb-2 text-base font-semibold text-gray-900"
          numberOfLines={1}
        >
          {company.name}
        </Text>

        <Text
          className="mb-3 text-sm leading-5 text-gray-500"
          numberOfLines={3}
        >
          {company.description}
        </Text>

        <View className="flex-row">
          <View className="rounded-full bg-indigo-50 px-3 py-1">
            <Text className="text-xs font-medium text-indigo-700">
              {company.tag.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default CompanyCard;
