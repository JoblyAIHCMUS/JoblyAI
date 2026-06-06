import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import type { JobCategory, EmploymentType } from '../../../../../types/job';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: JobCategory[];
  salaryMin: number;
  salaryMax: number;
  onSalaryChange: (min: number, max: number) => void;
  selectedTypes: EmploymentType[];
  onTypeChange: (types: EmploymentType[]) => void;
  selectedCategories: (number | string)[];
  onCategoryChange: (categoryIds: (number | string)[]) => void;
  onReset: () => void;
}

const EMPLOYMENT_TYPES: { label: string; value: EmploymentType }[] = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Freelance', value: 'FREELANCE' },
];

const SALARY_MAX_CAP = 500000;

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  categories,
  salaryMin,
  salaryMax,
  onSalaryChange,
  selectedTypes,
  onTypeChange,
  selectedCategories,
  onCategoryChange,
  onReset,
}) => {
  const [localSalaryMin, setLocalSalaryMin] = useState(salaryMin);
  const [localSalaryMax, setLocalSalaryMax] = useState(salaryMax);

  const handleSalarySubmit = () => {
    onSalaryChange(localSalaryMin, localSalaryMax);
  };

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

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/30"
      >
        <View className="absolute bottom-0 left-0 right-0 max-h-[85%] rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-[#e5e7eb] px-4 py-4">
            <Text className="text-xl font-bold text-[#111827]">Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Salary Range */}
            <View className="border-b border-[#e5e7eb] px-4 py-4">
              <Text className="mb-4 text-lg font-semibold text-[#111827]">
                Salary Range
              </Text>
              <View className="mb-4">
                <MultiSlider
                  values={[localSalaryMin, localSalaryMax]}
                  onValuesChange={(values) => {
                    setLocalSalaryMin(values[0]);
                    setLocalSalaryMax(values[1]);
                  }}
                  min={0}
                  max={SALARY_MAX_CAP}
                  step={10000}
                  trackStyle={{
                    height: 4,
                    backgroundColor: '#e5e7eb',
                  }}
                  selectedStyle={{
                    backgroundColor: '#4f46e5',
                  }}
                  markerStyle={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    backgroundColor: '#4f46e5',
                    borderWidth: 3,
                    borderColor: 'white',
                  }}
                  pressedMarkerStyle={{
                    height: 22,
                    width: 22,
                    borderRadius: 11,
                    backgroundColor: '#4f46e5',
                    borderWidth: 3,
                    borderColor: 'white',
                  }}
                  containerStyle={{ width: '100%' }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-[#6b7280]">
                  ${(localSalaryMin / 1000).toFixed(0)}k
                </Text>
                <Text className="text-sm text-[#6b7280]">
                  ${(localSalaryMax / 1000).toFixed(0)}k
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSalarySubmit}
                className="mt-4 rounded-lg bg-[#4f46e5] py-2"
              >
                <Text className="text-center font-semibold text-white">
                  Apply Salary Range
                </Text>
              </TouchableOpacity>
            </View>

            {/* Employment Type */}
            <View className="border-b border-[#e5e7eb] px-4 py-4">
              <Text className="mb-3 text-lg font-semibold text-[#111827]">
                Employment Type
              </Text>
              {EMPLOYMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => toggleType(type.value)}
                  className="mb-3 flex-row items-center gap-3 py-2"
                >
                  <View
                    className={`h-5 w-5 rounded border-2 ${
                      selectedTypes.includes(type.value)
                        ? 'border-[#4f46e5] bg-[#4f46e5]'
                        : 'border-[#d1d5db] bg-white'
                    }`}
                  >
                    {selectedTypes.includes(type.value) && (
                      <Text className="text-xs font-bold text-white">✓</Text>
                    )}
                  </View>
                  <Text className="flex-1 text-base text-[#374151]">
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories */}
            {categories.length > 0 && (
              <View className="px-4 py-4">
                <Text className="mb-3 text-lg font-semibold text-[#111827]">
                  Job Category
                </Text>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    className="mb-3 flex-row items-center gap-3 py-2"
                  >
                    <View
                      className={`h-5 w-5 rounded border-2 ${
                        selectedCategories.includes(String(category.id))
                          ? 'border-[#4f46e5] bg-[#4f46e5]'
                          : 'border-[#d1d5db] bg-white'
                      }`}
                    >
                      {selectedCategories.includes(String(category.id)) && (
                        <Text className="text-xs font-bold text-white">✓</Text>
                      )}
                    </View>
                    <Text className="flex-1 text-base text-[#374151]">
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View className="flex-row gap-3 border-t border-[#e5e7eb] px-4 py-4">
            <TouchableOpacity
              onPress={() => {
                onReset();
                onClose();
              }}
              className="flex-1 rounded-lg border border-[#e5e7eb] bg-white py-3"
            >
              <Text className="text-center font-semibold text-[#374151]">
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 rounded-lg bg-[#4f46e5] py-3"
            >
              <Text className="text-center font-semibold text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterPanel;
