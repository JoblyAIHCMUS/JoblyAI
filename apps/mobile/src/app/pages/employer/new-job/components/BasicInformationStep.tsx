'use client';

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import ModalPicker from '../../new-company/components/ModalPicker';
import CategorySelector from './CategorySelector';
import SalarySelector from './SalarySelector';
import SkillTagsManager, { type SkillEntry } from './SkillTagsManager';
import { EMPLOYMENT_TYPES } from '../constants';

interface BasicInformationStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  remote: boolean;
  onRemoteChange: (value: boolean) => void;
  location: string;
  onLocationChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  salaryMin?: number;
  onSalaryMinChange: (value: number | undefined) => void;
  salaryMax?: number;
  onSalaryMaxChange: (value: number | undefined) => void;
  skills: SkillEntry[];
  onSkillsChange: (value: SkillEntry[]) => void;
  errors?: Record<string, string>;
}

export const BasicInformationStep: React.FC<BasicInformationStepProps> = ({
  title,
  onTitleChange,
  type,
  onTypeChange,
  remote,
  onRemoteChange,
  location,
  onLocationChange,
  categoryId,
  onCategoryChange,
  currency,
  onCurrencyChange,
  salaryMin,
  onSalaryMinChange,
  salaryMax,
  onSalaryMaxChange,
  skills,
  onSkillsChange,
  errors = {},
}) => {
  const [showTypeModal, setShowTypeModal] = useState(false);

  const employmentTypeOptions = EMPLOYMENT_TYPES.map((type) => ({
    value: type.value,
    label: type.label,
  }));

  const selectedType = EMPLOYMENT_TYPES.find((t) => t.value === type);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 px-4 py-6"
      contentContainerClassName="gap-6 pb-8"
    >
      {/* Job Title */}
      <View className="gap-2">
        <Label className={`font-medium ${errors.title ? 'text-red-600' : ''}`}>
          Job Title *
        </Label>
        <Input
          placeholder="e.g. Software Engineer"
          value={title}
          onChangeText={onTitleChange}
          className={errors.title ? 'border-red-500 bg-red-50' : ''}
        />
        {errors.title && (
          <Text className="text-xs text-red-600">{errors.title}</Text>
        )}
      </View>

      {/* Employment Type */}
      <View className="gap-2">
        <Label className={`font-medium ${errors.type ? 'text-red-600' : ''}`}>
          Type of Employment *
        </Label>
        <TouchableOpacity
          onPress={() => setShowTypeModal(true)}
          className={`flex-row items-center justify-between px-4 py-3 rounded-lg border ${
            errors.type
              ? 'border-red-500 bg-red-50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <Text
            className={`text-base ${
              type ? 'text-slate-900 font-medium' : 'text-slate-500'
            }`}
          >
            {selectedType ? selectedType.label : 'Select employment type'}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>
        {errors.type && (
          <Text className="text-xs text-red-600">{errors.type}</Text>
        )}

        <ModalPicker
          open={showTypeModal}
          onOpenChange={setShowTypeModal}
          options={employmentTypeOptions}
          onSelect={onTypeChange}
          selectedValue={type}
          title="Select Employment Type"
        />
      </View>

      {/* Location Section */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Label className="font-medium">Remote Job</Label>
          <Switch
            value={remote}
            onValueChange={onRemoteChange}
            ios_backgroundColor="#CBD5E1"
          />
        </View>

        {!remote && (
          <View className="gap-2">
            <Label
              className={`font-medium ${errors.location ? 'text-red-600' : ''}`}
            >
              Location *
            </Label>
            <Input
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChangeText={onLocationChange}
              className={errors.location ? 'border-red-500 bg-red-50' : ''}
            />
            {errors.location && (
              <Text className="text-xs text-red-600">{errors.location}</Text>
            )}
          </View>
        )}
      </View>

      {/* Category */}
      <CategorySelector
        value={categoryId}
        onChange={onCategoryChange}
        error={errors.categoryId}
      />

      {/* Skills */}
      <SkillTagsManager skills={skills} onChange={onSkillsChange} />

      {/* Salary */}
      <SalarySelector
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        salaryMin={salaryMin}
        onSalaryMinChange={onSalaryMinChange}
        salaryMax={salaryMax}
        onSalaryMaxChange={onSalaryMaxChange}
        errors={{
          salaryMin: errors.salaryMin,
          salaryMax: errors.salaryMax,
        }}
      />
    </ScrollView>
  );
};

export default BasicInformationStep;
