import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CategoryIcon, ArrowRightIcon } from './svgs/Icons';

export interface Category {
  name: string;
  jobs: number;
  icon: string;
  active?: boolean;
}

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
}

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const { name, jobs, icon, active } = category;

  return (
    <TouchableOpacity
      className={`p-4 rounded-lg w-full mb-4 flex-row items-center border ${
        active
          ? 'bg-app-primary-1 border-app-primary-1'
          : 'bg-app-white-1 border-app-border-3'
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="mr-4">
        <CategoryIcon name={icon} active={active} />
      </View>

      <View className="flex-1">
        <Text
          className={`text-2xl font-bold mb-1 ${
            active ? 'text-white' : 'text-app-text-1'
          }`}
        >
          {name}
        </Text>
        <Text
          className={`text-base ${
            active ? 'text-white/80' : 'text-app-text-2'
          }`}
        >
          {jobs} {jobs === 1 ? 'job' : 'jobs'} available
        </Text>
      </View>

      <View className="ml-4">
        <ArrowRightIcon active={active} />
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCard;
