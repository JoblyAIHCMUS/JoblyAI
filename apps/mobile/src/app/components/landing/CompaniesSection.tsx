import React from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { Company } from '../../../types/company';

const { width } = Dimensions.get('window');

interface CompaniesSectionProps {
  companies: Company[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export const CompaniesSection = ({
  companies,
  loading,
  error,
  onRetry,
}: CompaniesSectionProps) => {
  const showLoading = loading && companies.length === 0;
  const showError = Boolean(error && companies.length === 0);

  return (
    <View className="bg-app-white-1 py-8 px-6">
      <Text className="text-xl font-bold text-app-slate-1 mb-6">
        Companies we helped grow
      </Text>
      {showLoading ? (
        <View className="h-[120px] items-center justify-center">
          <ActivityIndicator size="large" className="text-app-primary-1" />
        </View>
      ) : showError ? (
        <View className="items-center justify-center py-6">
          <Text className="mb-4 text-center text-app-red-3">
            Failed to load companies
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            className="rounded-lg bg-app-primary-1 px-6 py-2"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="gap-6">
          {error && (
            <View className="flex-row items-center justify-between rounded-lg bg-app-tag-red-bg px-3 py-2">
              <Text className="mr-3 flex-1 text-sm text-app-red-3">
                Failed to refresh companies
              </Text>
              <TouchableOpacity onPress={onRetry}>
                <Text className="font-semibold text-app-red-3">Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          <View className="flex-row flex-wrap justify-between items-center gap-4">
            {companies.map((company) => (
              <View
                key={company.id}
                style={{ width: (width - 80) / 3 }}
                className="h-[60px] items-center justify-center mb-4"
              >
                {company.logoUrl ? (
                  <Image
                    source={{ uri: company.logoUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                ) : (
                  <View className="bg-app-background-1 w-[50px] h-[50px] rounded-full items-center justify-center">
                    <Text className="text-2xl font-bold text-app-slate-1">
                      {company.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default CompaniesSection;
