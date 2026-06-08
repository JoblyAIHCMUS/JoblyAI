import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Building2, Users } from 'lucide-react-native';
import type { Company } from '../../../../../types/company';
import { SCALE_LABELS, INDUSTRY_LABELS } from '../constants';
import { COLORS } from '../../../../constants/theme';

interface CompanyBasicInfoProps {
  company: Company;
}

export function CompanyBasicInfo({ company }: CompanyBasicInfoProps) {
  return (
    <View className="px-4 pb-6">
      {/* Logo and Basic Details */}
      <View className="gap-4">
        {/* Logo */}
        <View>
          {company.logoUrl ? (
            <Image
              source={{ uri: company.logoUrl }}
              className="w-28 h-28 rounded-lg bg-slate-100"
              resizeMode="cover"
            />
          ) : (
            <View className="w-28 h-28 rounded-lg bg-slate-100 items-center justify-center border border-slate-200">
              <Building2 size={40} color={COLORS.slate400} />
            </View>
          )}
        </View>

        {/* Company Name */}
        <View>
          <Text className="text-3xl font-bold text-slate-900">
            {company.name}
          </Text>
        </View>

        {/* Website URL */}
        {company.websiteUrl && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              // In a real app, open the URL using Linking.openURL
            }}
          >
            <Text
              className="text-base text-blue-600 text-base"
              numberOfLines={1}
            >
              {company.websiteUrl}
            </Text>
          </TouchableOpacity>
        )}

        {/* Company Details Grid */}
        <View className="gap-4 mt-2">
          {/* Employees Count */}
          {company.sizeRange && (
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full border items-center justify-center"
                style={{
                  borderColor: COLORS.blue100,
                  backgroundColor: COLORS.blue100,
                }}
              >
                <Users size={20} color={COLORS.primary2} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium text-slate-500"
                  style={{ color: COLORS.slate500 }}
                >
                  Employees
                </Text>
                <Text className="text-lg font-semibold text-slate-900">
                  {SCALE_LABELS[company.sizeRange] || company.sizeRange}
                </Text>
              </View>
            </View>
          )}

          {/* Industry */}
          {company.industry && (
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full border items-center justify-center"
                style={{
                  borderColor: COLORS.blue100,
                  backgroundColor: COLORS.blue100,
                }}
              >
                <Building2 size={20} color={COLORS.primary2} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-medium text-slate-500"
                  style={{ color: COLORS.slate500 }}
                >
                  Industry
                </Text>
                <Text className="text-lg font-semibold text-slate-900">
                  {INDUSTRY_LABELS[company.industry] || company.industry}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
