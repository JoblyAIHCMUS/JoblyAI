import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import LogoUploader from './LogoUploader';
import ModalPicker from './ModalPicker';
import { SCALES, INDUSTRIES } from '../constants';

interface BasicInfoStepProps {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  website: string;
  onWebsiteChange: (value: string) => void;
  scale: string;
  onScaleChange: (value: string) => void;
  industry: string;
  onIndustryChange: (value: string) => void;
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
  errors: Record<string, any>;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  companyName,
  onCompanyNameChange,
  website,
  onWebsiteChange,
  scale,
  onScaleChange,
  industry,
  onIndustryChange,
  logoUrl,
  onLogoChange,
  errors,
}) => {
  const [showScaleModal, setShowScaleModal] = React.useState(false);
  const [showIndustryModal, setShowIndustryModal] = React.useState(false);
  const logoRef = useRef<{ resetPreview: () => void }>(null);

  const selectedScale = SCALES.find((s) => s.value === scale);
  const selectedIndustry = INDUSTRIES.find((i) => i.value === industry);

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
      <View className="gap-2">
        <Label
          className={
            errors.companyName ? 'text-red-600 font-medium' : 'font-medium'
          }
        >
          Company Name *
        </Label>
        <Input
          placeholder="Enter company name"
          value={companyName}
          onChangeText={onCompanyNameChange}
          editable={true}
          className={
            errors.companyName ? 'border-red-500 bg-red-50' : 'border-slate-200'
          }
        />
        {errors.companyName && (
          <Text className="text-xs text-red-600">
            {errors.companyName.message}
          </Text>
        )}
      </View>

      {/* Website */}
      <View className="gap-2">
        <Label className="font-medium">Website (Optional)</Label>
        <Input
          placeholder="e.g., example.com or https://example.com"
          value={website}
          onChangeText={onWebsiteChange}
          editable={true}
          className={
            errors.website ? 'border-red-500 bg-red-50' : 'border-slate-200'
          }
        />
        {errors.website && (
          <Text className="text-xs text-red-600">{errors.website.message}</Text>
        )}
      </View>

      {/* Scale */}
      <View className="gap-2">
        <Label className="font-medium">Company Size *</Label>
        <TouchableOpacity
          onPress={() => setShowScaleModal(true)}
          className={`flex-row items-center justify-between px-3 py-3 border rounded-lg bg-white ${
            errors.scale ? 'border-red-500 bg-red-50' : 'border-slate-200'
          }`}
        >
          <Text
            className={
              scale
                ? 'text-slate-900 font-medium'
                : 'text-slate-400 font-medium'
            }
          >
            {selectedScale?.label || 'Select company size'}
          </Text>
          <ChevronDown size={20} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>
        {errors.scale && (
          <Text className="text-xs text-red-600">{errors.scale.message}</Text>
        )}
      </View>

      {/* Industry */}
      <View className="gap-2">
        <Label className="font-medium">Industry *</Label>
        <TouchableOpacity
          onPress={() => setShowIndustryModal(true)}
          className={`flex-row items-center justify-between px-3 py-3 border rounded-lg bg-white ${
            errors.industry ? 'border-red-500 bg-red-50' : 'border-slate-200'
          }`}
        >
          <Text
            className={
              industry
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
      </View>

      {/* Scale Modal Picker */}
      <ModalPicker
        open={showScaleModal}
        onOpenChange={setShowScaleModal}
        options={SCALES}
        onSelect={onScaleChange}
        selectedValue={scale}
        title="Select Company Size"
      />

      {/* Industry Modal Picker */}
      <ModalPicker
        open={showIndustryModal}
        onOpenChange={setShowIndustryModal}
        options={INDUSTRIES}
        onSelect={onIndustryChange}
        selectedValue={industry}
        title="Select Industry"
      />
    </ScrollView>
  );
};

export default BasicInfoStep;
