'use client';

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import ModalPicker from '../../new-company/components/ModalPicker';
import { CURRENCIES } from '../constants';

type CurrencyCode = 'none' | 'usd' | 'eur' | 'gbp' | 'vnd' | 'jpy' | 'cny';

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  none: '',
  usd: 'en-US',
  eur: 'de-DE',
  gbp: 'en-GB',
  vnd: 'vi-VN',
  jpy: 'ja-JP',
  cny: 'zh-CN',
};

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  none: '',
  usd: '$',
  eur: '€',
  gbp: '£',
  vnd: '₫',
  jpy: '¥',
  cny: '¥',
};

function formatSalaryNumber(value: number | undefined, locale: string): string {
  if (value === undefined || Number.isNaN(value)) return '';
  if (!locale) return value.toString();
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

function currencyToLocale(currency: string): string {
  return CURRENCY_LOCALE[(currency as CurrencyCode) ?? 'none'] ?? '';
}

function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOL[(currency as CurrencyCode) ?? 'none'] ?? '';
}

const MAX_DIGITS = 15;

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
  onTriggerValidation?: () => void;
}

export const SalarySelector: React.FC<SalarySelectorProps> = ({
  currency,
  onCurrencyChange,
  salaryMin,
  onSalaryMinChange,
  salaryMax,
  onSalaryMaxChange,
  errors = {},
  onTriggerValidation,
}) => {
  const [showCurrencyModal, setShowCurrencyModal] = React.useState(false);

  const currencyOptions = CURRENCIES.map((curr) => ({
    value: curr.value,
    label: curr.label,
  }));

  const selectedCurrency = CURRENCIES.find((c) => c.value === currency);
  const showSalaryFields = currency && currency !== 'none';

  const handleSalaryMinChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, MAX_DIGITS);
    onSalaryMinChange(digits === '' ? undefined : parseInt(digits, 10));
    onTriggerValidation?.();
  };

  const handleSalaryMaxChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, MAX_DIGITS);
    onSalaryMaxChange(digits === '' ? undefined : parseInt(digits, 10));
    onTriggerValidation?.();
  };

  return (
    <View className="gap-4">
      {/* Currency Selector */}
      <View className="gap-2">
        <Label className="text-base font-medium">Salary (Optional)</Label>
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
          onSelect={(value) => {
            onCurrencyChange(value);
            if (value === 'none') {
              onSalaryMinChange(undefined);
              onSalaryMaxChange(undefined);
            }
          }}
          selectedValue={currency}
          title="Select Currency"
        />
      </View>

      {/* Salary Min/Max Fields */}
      {showSalaryFields && (
        <View className="gap-2">
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1">
              <Label
                className={`text-base font-medium ${
                  errors.salaryMin ? 'text-red-600' : ''
                }`}
              >
                Min <Text className="text-red-600">*</Text>
              </Label>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-base text-slate-500">
                  {currencySymbol(currency)}
                </Text>
                <View className="flex-1">
                  <Input
                    placeholder="0"
                    keyboardType="number-pad"
                    value={formatSalaryNumber(
                      salaryMin,
                      currencyToLocale(currency)
                    )}
                    onChangeText={handleSalaryMinChange}
                    className={
                      errors.salaryMin ? 'border-red-500 bg-red-50' : ''
                    }
                  />
                </View>
              </View>
              {errors.salaryMin && (
                <Text className="text-xs text-red-600">{errors.salaryMin}</Text>
              )}
            </View>

            <View className="flex-1 gap-1">
              <Label
                className={`text-base font-medium ${
                  errors.salaryMax ? 'text-red-600' : ''
                }`}
              >
                Max <Text className="text-red-600">*</Text>
              </Label>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-base text-slate-500">
                  {currencySymbol(currency)}
                </Text>
                <View className="flex-1">
                  <Input
                    placeholder="0"
                    keyboardType="number-pad"
                    value={formatSalaryNumber(
                      salaryMax,
                      currencyToLocale(currency)
                    )}
                    onChangeText={handleSalaryMaxChange}
                    className={
                      errors.salaryMax ? 'border-red-500 bg-red-50' : ''
                    }
                  />
                </View>
              </View>
              {errors.salaryMax && (
                <Text className="text-xs text-red-600">{errors.salaryMax}</Text>
              )}
            </View>
          </View>
          <Text className="text-xs text-slate-500">per month</Text>
        </View>
      )}
    </View>
  );
};

export default SalarySelector;
