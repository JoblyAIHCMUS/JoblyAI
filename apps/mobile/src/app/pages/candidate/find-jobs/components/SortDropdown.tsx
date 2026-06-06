import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import type { SortOption } from '../../../../../types/job';

interface SortDropdownProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most Relevant', value: 'MOST_RELEVANT' },
  { label: 'Newest', value: 'NEWEST' },
  { label: 'Oldest', value: 'OLDEST' },
  { label: 'Lowest Salary', value: 'SALARY_ASC' },
  { label: 'Highest Salary', value: 'SALARY_DESC' },
];

const SortDropdown: React.FC<SortDropdownProps> = ({
  selectedSort,
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel =
    SORT_OPTIONS.find((opt) => opt.value === selectedSort)?.label ||
    'Most Relevant';

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
        className="flex-row items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3"
      >
        <Text className="flex-1 text-sm font-semibold text-[#111827]">
          {selectedLabel}
        </Text>
        <ChevronDown size={18} color="#6b7280" strokeWidth={2} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          className="flex-1 bg-black/30"
        >
          <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white">
            <View className="border-b border-[#e5e7eb] px-4 py-4">
              <Text className="text-lg font-semibold text-[#111827]">
                Sort by
              </Text>
            </View>

            <FlatList
              data={SORT_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSortChange(item.value);
                    setIsOpen(false);
                  }}
                  className={`border-b border-[#f3f4f6] px-4 py-4 ${
                    selectedSort === item.value ? 'bg-[#f0f1ff]' : ''
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedSort === item.value
                        ? 'font-semibold text-[#4f46e5]'
                        : 'text-[#374151]'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default SortDropdown;
