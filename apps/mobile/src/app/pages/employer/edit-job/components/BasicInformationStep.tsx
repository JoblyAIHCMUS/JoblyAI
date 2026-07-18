'use client';

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormWatch,
} from 'react-hook-form';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import LocationAutocomplete from '../../../../../components/LocationAutocomplete';
import ModalPicker from '../../new-company/components/ModalPicker';
import CategorySelector from './CategorySelector';
import SalarySelector from './SalarySelector';
import SkillTagsManager from './SkillTagsManager';
import { EMPLOYMENT_TYPES } from '../constants';
import type { JobPostingFormData } from '../schema';

interface BasicInformationStepProps {
  control: Control<JobPostingFormData>;
  errors: FieldErrors<JobPostingFormData>;
  watch: UseFormWatch<JobPostingFormData>;
  formData: JobPostingFormData;
  onValidate?: () => void;
}

export const BasicInformationStep: React.FC<BasicInformationStepProps> = ({
  control,
  errors,
  watch,
  formData,
  onValidate,
}) => {
  const [showTypeModal, setShowTypeModal] = useState(false);

  const employmentTypeOptions = EMPLOYMENT_TYPES.map((type) => ({
    value: type.value,
    label: type.label,
  }));

  const selectedType = EMPLOYMENT_TYPES.find((t) => t.value === formData.type);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      className="flex-1 px-4 py-6"
      contentContainerClassName="gap-6 pb-8"
    >
      {/* Job Title */}
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <View className="gap-2">
            <Label
              className={`text-base font-medium ${
                errors.title ? 'text-red-600' : ''
              }`}
            >
              Job Title <Text className="text-red-600">*</Text>
            </Label>
            <Input
              placeholder="e.g. Software Engineer"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              className={errors.title ? 'border-red-500 bg-red-50' : ''}
            />
            {errors.title && (
              <Text className="text-xs text-red-600">
                {errors.title.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Employment Type */}
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <View className="gap-2">
            <Label
              className={`text-base font-medium ${
                errors.type ? 'text-red-600' : ''
              }`}
            >
              Type of Employment <Text className="text-red-600">*</Text>
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
                  field.value ? 'text-slate-900 font-medium' : 'text-slate-500'
                }`}
              >
                {selectedType ? selectedType.label : 'Select employment type'}
              </Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>
            {errors.type && (
              <Text className="text-xs text-red-600">
                {errors.type.message}
              </Text>
            )}

            <ModalPicker
              open={showTypeModal}
              onOpenChange={setShowTypeModal}
              options={employmentTypeOptions}
              onSelect={(value) => {
                field.onChange(value);
                setShowTypeModal(false);
              }}
              selectedValue={field.value}
              title="Select Employment Type"
            />
          </View>
        )}
      />

      {/* Location Section */}
      <Controller
        control={control}
        name="remote"
        render={({ field }) => (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label className="text-base font-medium">Remote Job</Label>
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ false: '#CBD5E1', true: '#000000' }}
                thumbColor="#f3f4f8"
              />
            </View>

            {!field.value && (
              <Controller
                control={control}
                name="location"
                render={({ field: locationField }) => (
                  <View className="gap-2">
                    <Label
                      className={`text-base font-medium ${
                        errors.location ? 'text-red-600' : ''
                      }`}
                    >
                      Location <Text className="text-red-600">*</Text>
                    </Label>
                    <LocationAutocomplete
                      value={locationField.value}
                      onChange={locationField.onChange}
                      onBlur={locationField.onBlur}
                      placeholder="Search for a location..."
                      error={!!errors.location}
                    />
                    {errors.location && (
                      <Text className="text-xs text-red-600">
                        {errors.location?.message as string}
                      </Text>
                    )}
                  </View>
                )}
              />
            )}
          </View>
        )}
      />

      {/* Category */}
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <CategorySelector
            value={field.value}
            onChange={field.onChange}
            error={errors.categoryId?.message}
          />
        )}
      />

      {/* Skills */}
      <Controller
        control={control}
        name="skills"
        render={({ field }) => (
          <SkillTagsManager skills={field.value} onChange={field.onChange} />
        )}
      />

      {/* Salary */}
      <Controller
        control={control}
        name="currency"
        render={({ field: currencyField }) => (
          <Controller
            control={control}
            name="salaryMin"
            render={({ field: salaryMinField }) => (
              <Controller
                control={control}
                name="salaryMax"
                render={({ field: salaryMaxField }) => (
                  <SalarySelector
                    currency={currencyField.value}
                    onCurrencyChange={currencyField.onChange}
                    salaryMin={salaryMinField.value}
                    onSalaryMinChange={salaryMinField.onChange}
                    salaryMax={salaryMaxField.value}
                    onSalaryMaxChange={salaryMaxField.onChange}
                    errors={{
                      salaryMin: errors.salaryMin?.message,
                      salaryMax: errors.salaryMax?.message,
                    }}
                    onTriggerValidation={onValidate}
                  />
                )}
              />
            )}
          />
        )}
      />
    </ScrollView>
  );
};

export default BasicInformationStep;
