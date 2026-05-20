'use client';

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import ModalPicker from '../../new-company/components/ModalPicker';
import { CURRENCIES } from '../constants';

interface SalarySelectorProps {
  currency: string;
  onCurrencyChange: (value: string) => void;
  salaryMin?: number;
  onSalaryMinChange: (value: number | undefined) => void;
  salaryMax?: number;
  onSalaryMaxChange: (value: number | undefined) => void;
  errors?: {
    salaryMin?: string;
    salaryMax?: string;
  };
}

export const SalarySelector: React.FC<SalarySelectorProps> = ({
  currency,
  onCurrencyChange,
  salaryMin,
  onSalaryMinChange,
  salaryMax,
  onSalaryMaxChange,
  errors = {},
}) => {
  const [showCurrencyModal, setShowCurrencyModal] = React.useState(false);

  const currencyOptions = CURRENCIES.map((curr) => ({
    value: curr.value,
    label: curr.label,
  }));

  const selectedCurrency = CURRENCIES.find((c) => c.value === currency);
  const showSalaryFields = currency && currency !== 'none';

  const handleSalaryMinChange = (text: string) => {
    const num = text.trim() === '' ? undefined : parseInt(text, 10);
    onSalaryMinChange(isNaN(num!) ? undefined : num);
  };

  const handleSalaryMaxChange = (text: string) => {
    const num = text.trim() === '' ? undefined : parseInt(text, 10);
    onSalaryMaxChange(isNaN(num!) ? undefined : num);
  };

  return (
    <View className="gap-4">
      {/* Currency Selector */}
      <View className="gap-2">
        <Label className="font-medium">Salary (Optional)</Label>
        <TouchableOpacity
          onPress={() => setShowCurrencyModal(true)}
          className="flex-row items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white"
        >
          <Text className="text-base text-slate-900 font-medium">
            {selectedCurrency ? selectedCurrency.label : 'Select currency'}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        <ModalPicker
          open={showCurrencyModal}
          onOpenChange={setShowCurrencyModal}
          options={currencyOptions}
          onSelect={onCurrencyChange}
          selectedValue={currency}
          title="Select Currency"
        />
      </View>

      {/* Salary Min/Max Fields */}
      {showSalaryFields && (
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1">
              <Label
                className={`text-sm font-medium ${
                  errors.salaryMin ? 'text-red-600' : ''
                }`}
              >
                Min *
              </Label>
              <Input
                placeholder="0"
                keyboardType="number-pad"
                value={salaryMin?.toString() || ''}
                onChangeText={handleSalaryMinChange}
                className={errors.salaryMin ? 'border-red-500 bg-red-50' : ''}
              />
              {errors.salaryMin && (
                <Text className="text-xs text-red-600">{errors.salaryMin}</Text>
              )}
            </View>

            <View className="flex-1 gap-1">
              <Label
                className={`text-sm font-medium ${
                  errors.salaryMax ? 'text-red-600' : ''
                }`}
              >
                Max *
              </Label>
              <Input
                placeholder="0"
                keyboardType="number-pad"
                value={salaryMax?.toString() || ''}
                onChangeText={handleSalaryMaxChange}
                className={errors.salaryMax ? 'border-red-500 bg-red-50' : ''}
              />
              {errors.salaryMax && (
                <Text className="text-xs text-red-600">{errors.salaryMax}</Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SalarySelector;
