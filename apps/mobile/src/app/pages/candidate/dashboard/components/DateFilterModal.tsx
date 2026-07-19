import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '@/app/constants/theme';
import type { DatePreset } from '../types';

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (preset: DatePreset, start: Date, end: Date, label: string) => void;
  currentPreset: DatePreset | null;
}

function computeDateRange(preset: DatePreset): {
  start: Date;
  end: Date;
  label: string;
} {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  switch (preset) {
    case 'TODAY': {
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      return { start: startOfDay, end: endOfDay, label: 'Today' };
    }
    case 'LAST_7_DAYS': {
      const last7 = new Date(now);
      last7.setDate(last7.getDate() - 6);
      const start = new Date(
        last7.getFullYear(),
        last7.getMonth(),
        last7.getDate()
      );
      return { start, end: endOfDay, label: 'This Week' };
    }
    case 'LAST_30_DAYS': {
      const last30 = new Date(now);
      last30.setDate(last30.getDate() - 29);
      const start = new Date(
        last30.getFullYear(),
        last30.getMonth(),
        last30.getDate()
      );
      return { start, end: endOfDay, label: 'Last 30 Days' };
    }
    case 'ALL_TIME': {
      return {
        start: new Date(0),
        end: new Date(8640000000000000),
        label: 'All Time',
      };
    }
  }
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

const PRESETS: { key: DatePreset; title: string }[] = [
  { key: 'TODAY', title: 'Today' },
  { key: 'LAST_7_DAYS', title: 'This Week' },
  { key: 'LAST_30_DAYS', title: 'Last 30 Days' },
  { key: 'ALL_TIME', title: 'All Time' },
];

export default function DateFilterModal({
  isOpen,
  onClose,
  onApply,
  currentPreset,
}: DateFilterModalProps) {
  const handleSelect = (preset: DatePreset) => {
    const { start, end, label } = computeDateRange(preset);
    onApply(preset, start, end, label);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white pb-8">
          <View className="flex-row items-center justify-between border-b border-[#d6ddeb] px-4 py-4">
            <Text className="text-xl font-bold text-[#25324b]">
              Filter by Date
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.darkText} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View className="px-4 pt-4">
            {PRESETS.map(({ key, title }) => {
              const active = currentPreset === key;
              const { start, end } = computeDateRange(key);
              const subtitle = `${formatDisplayDate(
                start
              )} - ${formatDisplayDate(end)}`;

              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(key)}
                  className={`mb-2 rounded-xl border px-4 py-4 ${
                    active
                      ? 'border-[#4640de] bg-[#eef0ff]'
                      : 'border-[#d6ddeb] bg-white'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      active ? 'text-[#4640de]' : 'text-[#25324b]'
                    }`}
                  >
                    {title}
                  </Text>
                  {key !== 'ALL_TIME' && (
                    <Text className="mt-1 text-xs text-[#7c8493]">
                      {subtitle}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
