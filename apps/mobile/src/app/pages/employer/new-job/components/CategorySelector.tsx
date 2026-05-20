'use client';

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Label } from '../../../../../components/ui/label';
import ModalPicker from '../../new-company/components/ModalPicker';
import { MOCK_CATEGORIES } from '../constants';

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

  const categories = MOCK_CATEGORIES.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  const selectedCategory = MOCK_CATEGORIES.find(
    (cat) => cat.id.toString() === value
  );

  return (
    <View className="gap-2">
      <Label className={error ? 'text-red-600 font-medium' : 'font-medium'}>
        Category *
      </Label>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className={`flex-row items-center justify-between px-4 py-3 rounded-lg border ${
          error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
        }`}
      >
        <Text
          className={`text-base ${
            value ? 'text-slate-900 font-medium' : 'text-slate-500'
          }`}
        >
          {selectedCategory ? selectedCategory.name : 'Select a category'}
        </Text>
        <ChevronDown size={20} color="#64748B" />
      </TouchableOpacity>
      {error && <Text className="text-xs text-red-600">{error}</Text>}

      <ModalPicker
        open={showModal}
        onOpenChange={setShowModal}
        options={categories}
        onSelect={onChange}
        selectedValue={value}
        title="Select Job Category"
      />
    </View>
  );
};

export default CategorySelector;
