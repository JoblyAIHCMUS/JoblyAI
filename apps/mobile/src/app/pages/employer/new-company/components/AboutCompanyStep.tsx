import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Label } from '../../../../../components/ui/label';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';
import type { CompanyRegistrationFormData } from '../schema';

interface AboutCompanyStepProps {
  control: Control<CompanyRegistrationFormData>;
  errors: FieldErrors<CompanyRegistrationFormData>;
  description: string;
}

export const AboutCompanyStep: React.FC<AboutCompanyStepProps> = ({
  control,
  errors,
  description,
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

        <Controller
          control={control}
          name="companyDescription"
          render={({ field: { value, onChange, onBlur } }) => (
            <View>
              <RichTextEditor
                content={value || ''}
                onChange={onChange}
                placeholder="Write a compelling description about your company..."
                editable={true}
              />
              {errors.companyDescription && (
                <Text className="text-xs text-red-600 mt-2">
                  {errors.companyDescription.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

export default AboutCompanyStep;
