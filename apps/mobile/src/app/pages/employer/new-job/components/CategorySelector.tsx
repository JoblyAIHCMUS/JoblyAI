'use client';

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Label } from '../../../../../components/ui/label';
import ModalPicker from '../../new-company/components/ModalPicker';
import { useCategories } from '../../../../../hooks/useCategories';
import { COLORS } from '@/app/constants/theme';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const { categories, loading, error: categoriesError } = useCategories();

  const categoryOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === value
  );

  return (
    <View className="gap-2">
      <Label
        className={
          error ? 'text-base text-red-600 font-medium' : 'text-base font-medium'
        }
      >
        Category <Text className="text-red-600">*</Text>
      </Label>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        disabled={loading}
        className={`flex-row items-center justify-between px-4 py-3 rounded-lg border ${
          error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <View className="flex-row items-center flex-1 gap-2">
          {loading && (
            <ActivityIndicator size="small" color={COLORS.slate500} />
          )}
          <Text
            className={`text-base ${
              value ? 'text-slate-900 font-medium' : 'text-slate-500'
            }`}
          >
            {selectedCategory ? selectedCategory.name : 'Select a category'}
          </Text>
        </View>
        <ChevronDown size={20} color={COLORS.slate500} />
      </TouchableOpacity>
      {error && <Text className="text-xs text-red-600">{error}</Text>}
      {categoriesError && (
        <Text className="text-xs text-red-600">Failed to load categories</Text>
      )}

      <ModalPicker
        open={showModal}
        onOpenChange={setShowModal}
        options={categoryOptions}
        onSelect={onChange}
        selectedValue={value}
        title="Select Job Category"
      />
    </View>
  );
};

export default CategorySelector;
