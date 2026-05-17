import React from 'react';
import { View, Text } from 'react-native';
import { applicantsSummary } from '../data/mockData';

export const ApplicantsSummary = () => {
  return (
    <View className="px-4 py-6">
      <View className="bg-white rounded-2xl p-5 border border-[#CBD5E1] shadow-sm mb-6">
        <Text className="text-xl font-bold text-[#0F172A] mb-2">Job Open</Text>
        <View className="flex-row items-baseline gap-x-2">
          <Text className="text-6xl font-extrabold text-[#0F172A]">12</Text>
          <Text className="text-[#475569] font-medium text-xl">Jobs Opened</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-5 border border-[#CBD5E1] shadow-sm">
        <Text className="text-xl font-bold text-[#0F172A] mb-4">Applicants Summary</Text>
        
        <View className="flex-row items-baseline gap-x-2 mb-6">
          <Text className="text-6xl font-extrabold text-[#0F172A]">{applicantsSummary.total}</Text>
          <Text className="text-[#475569] font-medium text-lg">Applicants</Text>
        </View>

        {/* Horizontal Stacked Bar */}
        <View className="h-3 flex-row overflow-hidden mb-6">
          <View className="flex-[0.4] bg-purple-500" />
          <View className="flex-[0.3] bg-cyan-400" />
          <View className="flex-[0.3] bg-orange-400" />
        </View>

        {/* Legend */}
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {applicantsSummary.breakdown.map((item, index) => (
            <View key={index} className="w-[48%] flex-row items-center gap-x-2">
              <View className="w-5 h-5 rounded" style={{ backgroundColor: item.color }} />
              <Text className="text-[#475569] text-base">{item.label} : <Text className="font-bold text-[#0F172A]">{item.count}</Text></Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
