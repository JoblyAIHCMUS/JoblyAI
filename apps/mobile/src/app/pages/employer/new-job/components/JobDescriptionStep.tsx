'use client';

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Label } from '../../../../../components/ui/label';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';
import type { JobPostingFormData } from '../schema';

interface JobDescriptionStepProps {
  control: Control<JobPostingFormData>;
  errors: FieldErrors<JobPostingFormData>;
}

export const JobDescriptionStep: React.FC<JobDescriptionStepProps> = ({
  control,
  errors,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 px-4 py-6"
      contentContainerClassName="gap-4 pb-8"
    >
      <View className="gap-2">
        <Label
          className={`font-medium ${errors.description ? 'text-red-600' : ''}`}
        >
          Job Description *
        </Label>
        <Text className="text-sm text-slate-600">
          Describe the role, key responsibilities, required skills,
          qualifications, what we offer, and any other important information.
        </Text>
      </View>

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <View
            className={`rounded-lg overflow-hidden ${
              errors.description ? 'border-2 border-red-500' : ''
            }`}
          >
            <RichTextEditor
              content={field.value}
              onChange={field.onChange}
              placeholder="Enter job description..."
              editable={true}
            />
            {errors.description && (
              <Text className="text-xs text-red-600 mt-2">
                {errors.description.message}
              </Text>
            )}
          </View>
        )}
      />
    </ScrollView>
  );
};

export default JobDescriptionStep;
