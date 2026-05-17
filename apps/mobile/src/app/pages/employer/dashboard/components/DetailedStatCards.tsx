import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export const DetailedStatCards = () => {
  return (
    <View className="px-4 gap-y-4">
      <View className="bg-white rounded-2xl p-5 border border-[#CBD5E1] shadow-sm flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-bold text-[#0F172A] mb-2">Job Views</Text>
          <View className="flex-row items-baseline gap-x-2">
            <Text className="text-4xl font-extrabold text-[#25324B]">2,342</Text>
            <Text className="text-[#64748B] text-base">This Week <Text className="text-[#22C55E] font-medium">6.4% ▲</Text></Text>
          </View>
        </View>
        <View className="w-10 h-10 rounded-full bg-[#F59E0B] items-center justify-center">
          <Feather name="eye" size={20} color="white" />
        </View>
      </View>

      <View className="bg-white rounded-2xl p-5 border border-[#CBD5E1] shadow-sm flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-bold text-[#0F172A] mb-2">Job Applied</Text>
          <View className="flex-row items-baseline gap-x-2">
            <Text className="text-4xl font-extrabold text-[#25324B]">654</Text>
            <Text className="text-[#64748B] text-base">This Week <Text className="text-[#EC4899] font-medium">0.5% ▼</Text></Text>
          </View>
        </View>
        <View className="w-10 h-10 rounded-full bg-[#A855F7] items-center justify-center">
          <Feather name="clipboard" size={20} color="white" />
        </View>
      </View>
    </View>
  );
};
