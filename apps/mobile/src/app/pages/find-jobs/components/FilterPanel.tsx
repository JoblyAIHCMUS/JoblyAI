import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { COLORS } from '@/app/constants/theme';
import type { JobCategory, EmploymentType } from '@/types/job';
import SalaryFilter from './SalaryFilter';
import type { SupportedCurrency } from '@/app/pages/find-jobs/constants';
import { KeyboardDismissView } from '@/components/KeyboardDismissView';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: JobCategory[];
  salaryCurrency: SupportedCurrency | null;
  salaryMin: number;
  salaryMax: number;
  onSalaryCurrencyChange: (currency: SupportedCurrency | null) => void;
  onSalaryChange: (min: number, max: number) => void;
  selectedTypes: EmploymentType[];
  onTypeChange: (types: EmploymentType[]) => void;
  selectedCategories: (number | string)[];
  onCategoryChange: (categoryIds: (number | string)[]) => void;
  onReset: () => void;
  onDone: () => void;
}

const EMPLOYMENT_TYPES: { label: string; value: EmploymentType }[] = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Freelance', value: 'FREELANCE' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  categories,
  salaryCurrency,
  salaryMin,
  salaryMax,
  onSalaryCurrencyChange,
  onSalaryChange,
  selectedTypes,
  onTypeChange,
  selectedCategories,
  onCategoryChange,
  onReset,
  onDone,
}) => {
  const toggleType = (type: EmploymentType) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    onTypeChange(updated);
  };

  const toggleCategory = (categoryId: number) => {
    const stringId = String(categoryId);
    const updated = selectedCategories.includes(stringId)
      ? selectedCategories.filter((id) => id !== stringId)
      : [...selectedCategories, stringId];
    onCategoryChange(updated);
  };

  const insets = useSafeAreaInsets();

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardDismissView className="flex-1" pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1 bg-black/30"
        />
        <View
          className="absolute bottom-0 left-0 right-0 max-h-[85%] rounded-t-3xl bg-white"
          pointerEvents="box-none"
          style={{ paddingBottom: 12 + insets.bottom }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-app-gray-1 px-4 py-4">
            <Text className="text-xl font-bold text-app-dark-text">
              Filters
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.darkText} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Salary Range */}
            <View className="border-b border-app-gray-1 px-4 py-4">
              <SalaryFilter
                currency={salaryCurrency}
                min={salaryMin}
                max={salaryMax}
                onCurrencyChange={onSalaryCurrencyChange}
                onValuesChange={onSalaryChange}
              />
            </View>

            {/* Employment Type */}
            <View className="border-b border-app-gray-1 px-4 py-4">
              <Text className="mb-3 text-lg font-semibold text-app-dark-text">
                Employment Type
              </Text>
              {EMPLOYMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => toggleType(type.value)}
                  className="mb-3 flex-row items-center gap-3 py-2"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded border-2 ${
                      selectedTypes.includes(type.value)
                        ? 'border-app-primary-2 bg-app-primary-2'
                        : 'border-app-border-unchecked bg-white'
                    }`}
                  >
                    {selectedTypes.includes(type.value) && (
                      <Text className="text-xs font-bold text-white">✓</Text>
                    )}
                  </View>
                  <Text className="flex-1 text-base text-app-gray-2">
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories */}
            {categories.length > 0 && (
              <View className="px-4 py-4">
                <Text className="mb-3 text-lg font-semibold text-app-dark-text">
                  Job Category
                </Text>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    className="mb-3 flex-row items-center gap-3 py-2"
                  >
                    <View
                      className={`h-5 w-5 items-center justify-center rounded border-2 ${
                        selectedCategories.includes(String(category.id))
                          ? 'border-app-primary-2 bg-app-primary-2'
                          : 'border-app-border-unchecked bg-white'
                      }`}
                    >
                      {selectedCategories.includes(String(category.id)) && (
                        <Text className="text-xs font-bold text-white">✓</Text>
                      )}
                    </View>
                    <Text className="flex-1 text-base text-app-gray-2">
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View className="flex-row gap-3 border-t border-app-gray-1 px-4 py-4">
            <TouchableOpacity
              onPress={onReset}
              className="flex-1 rounded-lg border border-app-gray-1 bg-white py-3"
            >
              <Text className="text-center font-semibold text-app-gray-2">
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDone}
              className="flex-1 rounded-lg bg-app-primary-2 py-3"
            >
              <Text className="text-center font-semibold text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardDismissView>
    </Modal>
  );
};

export default FilterPanel;
