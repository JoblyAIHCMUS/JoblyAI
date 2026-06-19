import React from 'react';
import { View, Text, Image } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import type { CompanyInfo } from '../../../../../types/job';

interface JobCompanySectionProps {
  company: CompanyInfo;
}

const JobCompanySection: React.FC<JobCompanySectionProps> = ({ company }) => {
  return (
    <View className="px-4 py-6">
      <View className="rounded-xl border border-app-gray-1 bg-white p-4">
        <View className="mb-3 flex-row items-center gap-3">
          {company.logoUrl ? (
            <Image
              source={{ uri: company.logoUrl }}
              className="h-16 w-16 rounded-lg"
              resizeMode="contain"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-lg bg-app-gray-1">
              <Text className="text-xl font-bold text-app-gray-3">
                {(company.name || 'C')[0]}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-bold text-app-dark-text">
              {company.name}
            </Text>
            {company.websiteUrl && (
              <View className="mt-1 flex-row items-center gap-1">
                <ExternalLink size={14} color={COLORS.primary2} />
                <Text className="text-sm text-app-primary-2">Read more</Text>
              </View>
            )}
          </View>
        </View>

        {company.description && (
          <Text className="text-sm leading-5 text-app-gray-3">
            {company.description.replace(/<[^>]*>/g, '')}
          </Text>
        )}

        {/* Company details */}
        <View className="mt-4 flex-row flex-wrap gap-4">
          {company.industry && (
            <View>
              <Text className="text-xs text-app-gray-3">Industry</Text>
              <Text className="text-sm font-medium text-app-dark-text">
                {company.industry}
              </Text>
            </View>
          )}
          {company.sizeRange && (
            <View>
              <Text className="text-xs text-app-gray-3">Company Size</Text>
              <Text className="text-sm font-medium text-app-dark-text">
                {company.sizeRange}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default JobCompanySection;
