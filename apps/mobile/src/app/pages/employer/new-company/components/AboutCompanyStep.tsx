import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Label } from '../../../../../components/ui/label';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';

interface AboutCompanyStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  errors: Record<string, any>;
}

export const AboutCompanyStep: React.FC<AboutCompanyStepProps> = ({
  description,
  onDescriptionChange,
  errors,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 gap-4 px-4 py-6"
      contentContainerClassName="gap-6 pb-8"
    >
      <View className="gap-3">
        <View>
          <Label className="text-base font-semibold text-slate-900">
            About Company
          </Label>
          <Text className="text-sm text-slate-600 mt-1">
            Tell us more about your company. This information will be visible to
            job seekers.
          </Text>
        </View>

        <View className="gap-2">
          <Label className="text-sm font-medium text-slate-700">
            Company Description (Optional)
          </Label>
          <Text className="text-xs text-slate-500">
            Supported: Bold, Italic, Strikethrough, Code, Headings (##, ###),
            Lists, Blockquotes
          </Text>
        </View>

        <RichTextEditor
          content={description}
          onChange={onDescriptionChange}
          placeholder="Write a compelling description about your company..."
          editable={true}
        />

        {errors.description && (
          <Text className="text-xs text-red-600">
            {errors.description.message}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default AboutCompanyStep;
