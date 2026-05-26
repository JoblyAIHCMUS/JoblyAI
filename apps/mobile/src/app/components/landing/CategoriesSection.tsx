import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CategoryCard } from '../shared/CategoryCard';
import { ArrowRightIconPrimary } from '../shared/svgs/Icons';
import { usePopularCategories } from '../../../hooks/usePopularCategories';

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

export const CategoriesSection = () => {
  const { categories, loading, error } = usePopularCategories(8);

  return (
    <View className="bg-app-background-1 py-8 px-6">
      <View className="mb-6">
        <Text className="text-4xl font-black text-app-text-1">
          Explore by <Text className="text-app-primary-1">category</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          className="text-app-primary-1 mt-8"
        />
      ) : error ? (
        <Text className="text-app-red-1 mt-4">
          Failed to load categories.
        </Text>
      ) : (
        <View className="mt-4">
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

       <TouchableOpacity className="flex-row items-center justify-start gap-1 mt-2" activeOpacity={0.7}>
         <Text className="text-lg font-bold text-app-primary-1">Show all jobs</Text>
        <ArrowRightIconPrimary />
      </TouchableOpacity>
    </View>
  );
};

export default CategoriesSection;
