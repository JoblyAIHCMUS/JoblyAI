import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import {
  SUPPORTED_CURRENCIES,
  SALARY_CAPS,
  SALARY_STEPS,
  SupportedCurrency,
  capFor,
  formatCurrencyValue,
} from '@/app/pages/find-jobs/constants';
import { COLORS } from '@/app/constants/theme';

interface SalaryFilterProps {
  currency: SupportedCurrency | null;
  min: number;
  max: number;
  onCurrencyChange: (currency: SupportedCurrency | null) => void;
  onValuesChange: (min: number, max: number) => void;
}

const SalaryFilter: React.FC<SalaryFilterProps> = ({
  currency,
  min,
  max,
  onCurrencyChange,
  onValuesChange,
}) => {
  const { width } = useWindowDimensions();
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [inputsExpanded, setInputsExpanded] = useState(false);

  // Sync internal values when parent draft values change.
  useEffect(() => {
    setLocalMin(min);
    setLocalMax(max);
  }, [min, max]);

  const handleSliderChange = (values: number[]) => {
    setLocalMin(values[0]);
    setLocalMax(values[1]);
    onValuesChange(values[0], values[1]);
  };

  const handlePickerSelect = (next: SupportedCurrency | null) => {
    setPickerOpen(false);
    if (next === null) {
      onCurrencyChange(null);
      return;
    }
    // Unconditionally reset the slider to the new currency's full range.
    // Preserving the previous numeric range would keep a stale USD cap
    // (500k) when switching to VND — re-introducing the exact bug this
    // feature fixes. Matches the web's handleCurrencyChange at
    // apps/web/src/components/find-jobs/SalaryFilter.tsx:69-82.
    const newCap = capFor(next);
    setLocalMin(0);
    setLocalMax(newCap);
    onValuesChange(0, newCap);
    onCurrencyChange(next);
  };

  const handleInputChange = (field: 'min' | 'max', text: string) => {
    // Strip non-digits so a paste artifact or the numeric keyboard's
    // occasional non-numeric input doesn't break parsing.
    const cleaned = text.replace(/[^0-9]/g, '');
    const parsed = cleaned === '' ? 0 : parseInt(cleaned, 10);
    if (isNaN(parsed)) return;
    const cap = capFor(currency);
    if (field === 'min') {
      // Clamp to [0, localMax] so min never exceeds max.
      setLocalMin(Math.max(0, Math.min(parsed, localMax)));
    } else {
      // Clamp to [localMin, cap] so max never goes below min and never
      // exceeds the per-currency cap.
      setLocalMax(Math.max(localMin, Math.min(parsed, cap)));
    }
  };

  const handleInputCommit = () => {
    onValuesChange(localMin, localMax);
  };

  const currentLabel = currency ?? 'All';
  const inputMaxLength =
    currency !== null ? String(capFor(currency)).length : 1;

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-app-dark-text">
          Salary Range
        </Text>
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          className="flex-row items-center gap-1 rounded-lg border border-app-gray-1 bg-white px-3 py-2"
          accessibilityRole="button"
          accessibilityLabel={`Salary currency: ${currentLabel}`}
        >
          <Text className="text-sm font-medium text-app-dark-text">
            {currentLabel}
          </Text>
          <ChevronDown size={16} color={COLORS.darkText} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {currency !== null ? (
        <>
          <View className="mb-4 flex-row items-center justify-center">
            <MultiSlider
              values={[localMin, localMax]}
              onValuesChange={(values) => {
                setLocalMin(values[0]);
                setLocalMax(values[1]);
              }}
              onValuesChangeFinish={handleSliderChange}
              min={0}
              max={SALARY_CAPS[currency]}
              step={SALARY_STEPS[currency]}
              sliderLength={width - 120}
              trackStyle={{
                height: 4,
                backgroundColor: COLORS.gray1,
              }}
              selectedStyle={{
                backgroundColor: COLORS.primary2,
              }}
              markerStyle={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: COLORS.primary2,
                borderWidth: 3,
                borderColor: COLORS.white,
              }}
              pressedMarkerStyle={{
                height: 24,
                width: 24,
                borderRadius: 11,
                backgroundColor: COLORS.primary2,
                borderWidth: 3,
                borderColor: COLORS.white,
              }}
              containerStyle={{ width: '100%' }}
            />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-app-gray-3">
              {formatCurrencyValue(localMin, currency)}
            </Text>
            <Text className="text-sm text-app-gray-3">
              {formatCurrencyValue(localMax, currency)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setInputsExpanded((e) => !e)}
            className="mt-3 flex-row items-center justify-center gap-1"
            accessibilityRole="button"
            accessibilityLabel={
              inputsExpanded
                ? 'Hide exact value inputs'
                : 'Show exact value inputs'
            }
          >
            <Text className="text-sm font-medium text-app-primary-2">
              Type exact value
            </Text>
            {inputsExpanded ? (
              <ChevronUp size={16} color={COLORS.primary2} strokeWidth={2} />
            ) : (
              <ChevronDown size={16} color={COLORS.primary2} strokeWidth={2} />
            )}
          </TouchableOpacity>
          {inputsExpanded ? (
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1 flex-row items-center rounded-lg border border-app-gray-1 bg-white px-3 py-2">
                <Text className="mr-2 text-sm text-app-gray-3">Min</Text>
                <TextInput
                  value={String(localMin)}
                  onChangeText={(text) => handleInputChange('min', text)}
                  onEndEditing={handleInputCommit}
                  keyboardType="numeric"
                  className="flex-1 text-sm text-app-dark-text"
                  placeholder="0"
                  placeholderTextColor={COLORS.gray3}
                  returnKeyType="done"
                  maxLength={inputMaxLength}
                />
              </View>
              <View className="flex-1 flex-row items-center rounded-lg border border-app-gray-1 bg-white px-3 py-2">
                <Text className="mr-2 text-sm text-app-gray-3">Max</Text>
                <TextInput
                  value={String(localMax)}
                  onChangeText={(text) => handleInputChange('max', text)}
                  onEndEditing={handleInputCommit}
                  keyboardType="numeric"
                  className="flex-1 text-sm text-app-dark-text"
                  placeholder="0"
                  placeholderTextColor={COLORS.gray3}
                  returnKeyType="done"
                  maxLength={inputMaxLength}
                />
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPickerOpen(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <TouchableOpacity
            activeOpacity={1}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onPress={() => {}}
            className="w-full max-w-sm rounded-2xl bg-white p-2"
          >
            <TouchableOpacity
              onPress={() => handlePickerSelect(null)}
              className={`rounded-lg px-4 py-3 ${
                currency === null ? 'bg-app-gray-1' : 'bg-white'
              }`}
            >
              <Text className="text-base text-app-dark-text">All</Text>
            </TouchableOpacity>
            {SUPPORTED_CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => handlePickerSelect(c)}
                className={`rounded-lg px-4 py-3 ${
                  currency === c ? 'bg-app-gray-1' : 'bg-white'
                }`}
              >
                <Text className="text-base text-app-dark-text">{c}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SalaryFilter;
