import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CategoryCard } from '../shared/CategoryCard';
import { ArrowRightIconPrimary } from '../shared/svgs/Icons';
import type { PopularJobCategory } from '../../../types/job';

// Helper to map category names to local icons
const getCategoryIcon = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('design')) return 'Paintbrush';
  if (normalized.includes('sale') || normalized.includes('chart'))
    return 'BarChart3';
  if (normalized.includes('marketing')) return 'Megaphone';
  if (normalized.includes('finance') || normalized.includes('money'))
    return 'Wallet';
  if (normalized.includes('tech') || normalized.includes('it'))
    return 'Monitor';
  if (
    normalized.includes('engineer') ||
    normalized.includes('code') ||
    normalized.includes('develop')
  )
    return 'Code';
  if (
    normalized.includes('human') ||
    normalized.includes('hr') ||
    normalized.includes('people')
  )
    return 'Users';
  return 'Briefcase'; // Fallback
};

interface CategoriesSectionProps {
  categories: PopularJobCategory[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export const CategoriesSection = ({
  categories,
  loading,
  error,
  onRetry,
}: CategoriesSectionProps) => {
  const showLoading = loading && categories.length === 0;
  const showError = Boolean(error && categories.length === 0);

  return (
    <View className="bg-app-background-1 py-8 px-6">
      <View className="mb-6">
        <Text className="text-4xl font-black text-app-text-1">
          Explore by <Text className="text-app-primary-1">category</Text>
        </Text>
      </View>

      {showLoading ? (
        <ActivityIndicator size="large" className="text-app-primary-1 mt-8" />
      ) : showError ? (
        <View className="items-center justify-center py-6">
          <Text className="mb-4 text-center text-app-red-1">
            Failed to load categories.
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            className="rounded-lg bg-app-primary-1 px-6 py-2"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-4">
          {error && (
            <View className="mb-4 flex-row items-center justify-between rounded-lg bg-app-tag-red-bg px-3 py-2">
              <Text className="mr-3 flex-1 text-sm text-app-red-1">
                Failed to refresh categories.
              </Text>
              <TouchableOpacity onPress={onRetry}>
                <Text className="font-semibold text-app-red-1">Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          {categories.map((category) => (
            <CategoryCard
              key={category.id.toString()}
              category={{
                name: category.name,
                jobs: category.jobCount,
                icon: getCategoryIcon(category.name),
                active: false,
              }}
            />
          ))}
        </View>
      )}

      <TouchableOpacity
        className="flex-row items-center justify-start gap-1 mt-2"
        activeOpacity={0.7}
      >
        <Text className="text-lg font-bold text-app-primary-1">
          Show all jobs
        </Text>
        <ArrowRightIconPrimary />
      </TouchableOpacity>
    </View>
  );
};

export default CategoriesSection;
