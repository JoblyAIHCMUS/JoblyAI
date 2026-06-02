import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

import {
  formatInputDate,
  getDateRangeForPreset,
  parseDateInput,
} from '../utils';
import type { DatePreset, DateRangeInput } from '../types';

const QUICK_PRESETS: Array<{ key: DatePreset; label: string }> = [
  { key: 'TODAY', label: 'Today' },
  { key: 'LAST_7_DAYS', label: 'Last 7 days' },
  { key: 'LAST_30_DAYS', label: 'Last 30 days' },
];

interface ApplicationsFilterSheetProps {
  visible: boolean;
  dateRange: DateRangeInput;
  currentPreset: DatePreset;
  onPresetSelect: (preset: DatePreset) => void;
  onChangeDateRange: (range: DateRangeInput) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function ApplicationsFilterSheet({
  visible,
  dateRange,
  currentPreset,
  onPresetSelect,
  onChangeDateRange,
  onApply,
  onClear,
  onClose,
}: ApplicationsFilterSheetProps) {
  const canApply = Boolean(parseDateInput(dateRange.from) && parseDateInput(dateRange.to));

  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/20 px-3 pb-6">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View className="rounded-3xl border border-app-border-light bg-white px-4 py-4 shadow-2xl shadow-black/10">
          <View className="mb-4 flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-lg font-bold text-app-text-4">
                Filter by date range
              </Text>
              <Text className="text-sm text-app-text-5">
                Choose a period to narrow your applications.
              </Text>
            </View>

            <View className="h-10 w-10 items-center justify-center rounded-full bg-app-indigo-soft">
              <Text className="text-xs font-bold text-app-indigo-strong">📅</Text>
            </View>
          </View>

          <View className="flex-row gap-2 pb-4">
            {QUICK_PRESETS.map((preset) => {
              const isActive = currentPreset === preset.key;

              return (
                <Button
                  key={preset.key}
                  variant="outline"
                  className={`h-9 flex-1 rounded-full border-app-border-light px-3 ${
                    isActive ? 'bg-app-indigo-soft' : 'bg-white'
                  }`}
                  onPress={() => {
                    const nextRange = getDateRangeForPreset(preset.key);

                    onChangeDateRange({
                      from: formatInputDate(nextRange.from),
                      to: formatInputDate(nextRange.to),
                    });
                    onPresetSelect(preset.key);
                  }}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? 'text-app-indigo-strong' : 'text-app-text-5'
                    }`}
                  >
                    {preset.label}
                  </Text>
                </Button>
              );
            })}
          </View>

          <View className="gap-3 rounded-2xl border border-app-border-light bg-app-neutral-1 p-3">
            <View className="gap-2">
              <Label className="text-sm font-semibold text-app-text-4">From</Label>
              <Input
                className="h-12 rounded-xl border-app-border-light bg-white px-3 text-sm text-app-text-4"
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#7C8493"
                value={dateRange.from}
                onChangeText={(value) =>
                  onChangeDateRange({ ...dateRange, from: value })
                }
              />
            </View>

            <View className="gap-2">
              <Label className="text-sm font-semibold text-app-text-4">To</Label>
              <Input
                className="h-12 rounded-xl border-app-border-light bg-white px-3 text-sm text-app-text-4"
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#7C8493"
                value={dateRange.to}
                onChangeText={(value) =>
                  onChangeDateRange({ ...dateRange, to: value })
                }
              />
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              className="h-10 flex-1 rounded-xl border-app-border-light bg-white"
              onPress={onClear}
            >
              <Text className="text-sm font-semibold text-app-text-4">Clear</Text>
            </Button>

            <Button
              className="h-10 flex-1 rounded-xl bg-app-indigo-strong"
              disabled={!canApply}
              onPress={onApply}
            >
              <Text className="text-sm font-semibold text-white">Apply</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}