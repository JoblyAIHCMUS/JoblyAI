import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { ChevronDown } from 'lucide-react-native';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import LogoUploader from '../../new-company/components/LogoUploader';
import ModalPicker from '../../new-company/components/ModalPicker';
import { SCALES, INDUSTRIES } from '../../new-company/constants';
import type { CompanyUpdateFormData } from '../schema';

interface BasicInfoStepEditProps {
  control: Control<CompanyUpdateFormData>;
  errors: FieldErrors<CompanyUpdateFormData>;
  isValidating: boolean;
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

export const BasicInfoStepEdit: React.FC<BasicInfoStepEditProps> = ({
  control,
  errors,
  isValidating,
  logoUrl,
  onLogoChange,
}) => {
  const [showScaleModal, setShowScaleModal] = React.useState(false);
  const [showIndustryModal, setShowIndustryModal] = React.useState(false);
  const logoRef = useRef<{ resetPreview: () => void }>(null);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 gap-4 px-4 py-6"
      contentContainerClassName="gap-6 pb-8"
    >
      {/* Logo Uploader */}
      <View className="gap-2">
        <Label className="text-base font-semibold text-slate-900">
          Company Logo
        </Label>
        <LogoUploader
          onValueChange={(url) => onLogoChange(url)}
          ref={logoRef}
        />
      </View>

      {/* Company Name */}
      <Controller
        control={control}
        name="companyName"
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="gap-2">
            <Label
              className={`text-base ${
                errors.companyName ? 'text-red-600 font-medium' : 'font-medium'
              }`}
            >
              Company Name <Text className="text-red-600">*</Text>
            </Label>
            <Input
              placeholder="Enter company name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={true}
              className={
                errors.companyName
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200'
              }
            />
            {isValidating && !errors.companyName && (
              <Text className="text-xs text-blue-600">
                Checking availability...
              </Text>
            )}
            {errors.companyName && (
              <Text className="text-xs text-red-600">
                {errors.companyName.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Website */}
      <Controller
        control={control}
        name="website"
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="gap-2">
            <Label className="text-base font-medium">Website (Optional)</Label>
            <Input
              placeholder="e.g., example.com or https://example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={true}
              className={
                errors.website ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }
            />
            {errors.website && (
              <Text className="text-xs text-red-600">
                {errors.website.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Scale */}
      <Controller
        control={control}
        name="scale"
        render={({ field: { value, onChange } }) => {
          const selectedScale = SCALES.find((s) => s.value === value);
          return (
            <View className="gap-2">
              <Label className="text-base font-medium">
                Company Size <Text className="text-red-600">*</Text>
              </Label>
              <TouchableOpacity
                onPress={() => setShowScaleModal(true)}
                className={`flex-row items-center justify-between px-3 py-3 border rounded-lg bg-white ${
                  errors.scale ? 'border-red-500 bg-red-50' : 'border-slate-200'
                }`}
              >
                <Text
                  className={
                    value
                      ? 'text-slate-900 font-medium'
                      : 'text-slate-400 font-medium'
                  }
                >
                  {selectedScale?.label || 'Select company size'}
                </Text>
                <ChevronDown size={20} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
              {errors.scale && (
                <Text className="text-xs text-red-600">
                  {errors.scale.message}
                </Text>
              )}
              <ModalPicker
                open={showScaleModal}
                onOpenChange={setShowScaleModal}
                options={SCALES}
                onSelect={onChange}
                selectedValue={value as string}
                title="Select Company Size"
              />
            </View>
          );
        }}
      />

      {/* Industry */}
      <Controller
        control={control}
        name="industry"
        render={({ field: { value, onChange } }) => {
          const selectedIndustry = INDUSTRIES.find((i) => i.value === value);
          return (
            <View className="gap-2">
              <Label className="text-base font-medium">
                Industry <Text className="text-red-600">*</Text>
              </Label>
              <TouchableOpacity
                onPress={() => setShowIndustryModal(true)}
                className={`flex-row items-center justify-between px-3 py-3 border rounded-lg bg-white ${
                  errors.industry
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200'
                }`}
              >
                <Text
                  className={
                    value
                      ? 'text-slate-900 font-medium'
                      : 'text-slate-400 font-medium'
                  }
                >
                  {selectedIndustry?.label || 'Select industry'}
                </Text>
                <ChevronDown size={20} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
              {errors.industry && (
                <Text className="text-xs text-red-600">
                  {errors.industry.message}
                </Text>
              )}
              <ModalPicker
                open={showIndustryModal}
                onOpenChange={setShowIndustryModal}
                options={INDUSTRIES}
                onSelect={onChange}
                selectedValue={value as string}
                title="Select Industry"
              />
            </View>
          );
        }}
      />
    </ScrollView>
  );
};

export default BasicInfoStepEdit;
