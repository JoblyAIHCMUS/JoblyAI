import React from 'react';
import { View, Text, Dimensions, Image } from 'react-native';
import { useTopCompanies } from '../../../hooks';

const { width } = Dimensions.get('window');

export const CompaniesSection = () => {
  const { companies, loading, error } = useTopCompanies(6);

  if (loading || error || companies.length === 0) {
    return null; // or a loading skeleton
  }

  return (
    <View className="bg-app-white-1 py-8 px-6">
      <Text className="text-xl font-bold text-app-slate-1 mb-6">Companies we helped grow</Text>
      <View className="gap-6">
        <View className="flex-row flex-wrap justify-between items-center gap-4">
           {companies.map((company) => (
             <View key={company.id} style={{ width: (width - 80) / 3 }} className="h-[60px] items-center justify-center mb-4">
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
    </View>
  );
};

export default CompaniesSection;
