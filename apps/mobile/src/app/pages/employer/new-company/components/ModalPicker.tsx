import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

export interface PickerOption {
  value: string;
  label: string;
}

interface ModalPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: readonly PickerOption[];
  onSelect: (value: string) => void;
  selectedValue: string;
  title: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const ModalPicker: React.FC<ModalPickerProps> = ({
  open,
  onOpenChange,
  options,
  onSelect,
  selectedValue,
  title,
  searchable = false,
  searchPlaceholder = 'Search...',
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1 bg-black/50 flex items-center justify-end">
        <View className="w-full bg-white rounded-t-2xl max-h-96">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200">
            <Text className="text-lg font-bold text-slate-900">{title}</Text>
            <TouchableOpacity onPress={() => onOpenChange(false)}>
              <X size={24} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.value);
                  onOpenChange(false);
                }}
                className="px-4 py-4 border-b border-slate-100 flex-row items-center justify-between active:bg-slate-50"
              >
                <Text
                  className={`text-base font-medium ${
                    item.value === selectedValue
                      ? 'text-indigo-600'
                      : 'text-slate-900'
                  }`}
                >
                  {item.label}
                </Text>
                {item.value === selectedValue && (
                  <View className="w-3 h-3 rounded-full bg-indigo-600" />
                )}
              </TouchableOpacity>
            )}
            scrollEnabled={true}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ModalPicker;
