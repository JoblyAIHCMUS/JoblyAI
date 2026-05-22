'use client';

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Label } from '../../../../../components/ui/label';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';

interface JobDescriptionStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  error?: string;
}

export const JobDescriptionStep: React.FC<JobDescriptionStepProps> = ({
  description,
  onDescriptionChange,
  error,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 px-4 py-6"
      contentContainerClassName="gap-4 pb-8"
    >
      <View className="gap-2">
        <Label className={`font-medium ${error ? 'text-red-600' : ''}`}>
          Job Description *
        </Label>
        <Text className="text-sm text-slate-600">
          Describe the role, key responsibilities, required skills,
          qualifications, what we offer, and any other important information.
        </Text>
      </View>

      <View
        className={`rounded-lg overflow-hidden ${
          error ? 'border-2 border-red-500' : ''
        }`}
      >
        <RichTextEditor
          content={description}
          onChange={onDescriptionChange}
          placeholder="Enter job description..."
          editable={true}
        />
      </View>

      {error && <Text className="text-xs text-red-600">{error}</Text>}
    </ScrollView>
  );
};

export default JobDescriptionStep;
