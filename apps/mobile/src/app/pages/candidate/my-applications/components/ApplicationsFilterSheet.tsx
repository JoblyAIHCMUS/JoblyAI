import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

import {
  formatInputDate,
  getDateRangeForPreset,
  parseDateInput,
} from '../../dashboard/utils';
import type { DatePreset, DateRangeInput } from '../../dashboard/types';
import { COLORS } from '@/app/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardDismissView } from '@/components/KeyboardDismissView';

const QUICK_PRESETS: Array<{ key: DatePreset; label: string }> = [
  { key: 'TODAY', label: 'Today' },
  { key: 'LAST_7_DAYS', label: 'Last 7 days' },
  { key: 'LAST_30_DAYS', label: 'Last 30 days' },
];

interface ApplicationsFilterSheetProps {
  visible: boolean;
  dateRange: DateRangeInput;
  currentPreset: DatePreset;
  company: string;
  jobType: string;
  location: string;
  companyOptions: string[];
  jobTypeOptions: string[];
  locationOptions: string[];
  onCompanyChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
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
  company,
  jobType,
  location,
  companyOptions,
  jobTypeOptions,
  locationOptions,
  onCompanyChange,
  onJobTypeChange,
  onLocationChange,
  onPresetSelect,
  onChangeDateRange,
  onApply,
  onClear,
  onClose,
}: ApplicationsFilterSheetProps) {
  const canApply = Boolean(
    parseDateInput(dateRange.from) && parseDateInput(dateRange.to)
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardDismissView className="flex-1 justify-end bg-black/20 px-3">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <SafeAreaView
          edges={['bottom']}
          className="max-h-[85%] rounded-3xl border border-app-border-light bg-white px-4 py-4 pb-4 shadow-2xl shadow-black/10"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4 flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-lg font-bold text-app-text-4">
                  Filter Applications
                </Text>
                <Text className="text-sm text-app-text-5">
                  Narrow down your applications.
                </Text>
              </View>

              <View className="h-10 w-10 items-center justify-center rounded-full bg-app-indigo-soft">
                <Text className="text-xs font-bold text-app-indigo-strong">
                  Filters
                </Text>
              </View>
            </View>

            <View className="gap-4">
              <View className="gap-2">
                <Label className="text-sm font-semibold text-app-text-4">
                  Date Range
                </Label>
                <View className="flex-row gap-2">
                  {QUICK_PRESETS.map((preset) => {
                    const isActive = currentPreset === preset.key;

                    return (
                      <Button
                        key={preset.key}
                        variant="outline"
                        className={`min-h-11 flex-1 rounded-full border-app-border-light px-3 ${
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
                            isActive
                              ? 'text-app-indigo-strong'
                              : 'text-app-text-5'
                          }`}
                        >
                          {preset.label}
                        </Text>
                      </Button>
                    );
                  })}
                </View>
              </View>

              <View className="gap-3 rounded-2xl border border-app-border-light bg-app-neutral-1 p-3">
                <View className="gap-2">
                  <Label className="text-sm font-semibold text-app-text-4">
                    From
                  </Label>
                  <Input
                    className="h-12 rounded-xl border-app-border-light bg-white px-3 text-sm text-app-text-4"
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={COLORS.textLight}
                    value={dateRange.from}
                    onChangeText={(value) =>
                      onChangeDateRange({ ...dateRange, from: value })
                    }
                  />
                </View>

                <View className="gap-2">
                  <Label className="text-sm font-semibold text-app-text-4">
                    To
                  </Label>
                  <Input
                    className="h-12 rounded-xl border-app-border-light bg-white px-3 text-sm text-app-text-4"
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={COLORS.textLight}
                    value={dateRange.to}
                    onChangeText={(value) =>
                      onChangeDateRange({ ...dateRange, to: value })
                    }
                  />
                </View>
              </View>

              <View className="gap-2">
                <Label className="text-sm font-semibold text-app-text-4">
                  Company
                </Label>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-2"
                >
                  <View className="flex-row flex-wrap gap-2">
                    {companyOptions.map((opt) => (
                      <Button
                        key={opt}
                        variant="outline"
                        className={`min-h-11 rounded-full border-app-border-light px-3 ${
                          company === opt ? 'bg-app-indigo-soft' : 'bg-white'
                        }`}
                        onPress={() =>
                          onCompanyChange(company === opt ? '' : opt)
                        }
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            company === opt
                              ? 'text-app-indigo-strong'
                              : 'text-app-text-5'
                          }`}
                        >
                          {opt}
                        </Text>
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View className="gap-2">
                <Label className="text-sm font-semibold text-app-text-4">
                  Location
                </Label>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-2"
                >
                  <View className="flex-row flex-wrap gap-2">
                    {locationOptions.map((opt) => (
                      <Button
                        key={opt}
                        variant="outline"
                        className={`min-h-11 rounded-full border-app-border-light px-3 ${
                          location === opt ? 'bg-app-indigo-soft' : 'bg-white'
                        }`}
                        onPress={() =>
                          onLocationChange(location === opt ? '' : opt)
                        }
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            location === opt
                              ? 'text-app-indigo-strong'
                              : 'text-app-text-5'
                          }`}
                        >
                          {opt}
                        </Text>
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View className="mt-4 flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-xl border-app-border-light bg-white"
                onPress={onClear}
              >
                <Text className="text-sm font-semibold text-app-text-4">
                  Clear
                </Text>
              </Button>

              <Button
                className="h-10 flex-1 rounded-xl bg-app-indigo-strong"
                disabled={!canApply}
                onPress={onApply}
              >
                <Text className="text-sm font-semibold text-white">
                  Apply Filters
                </Text>
              </Button>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardDismissView>
    </Modal>
  );
}
