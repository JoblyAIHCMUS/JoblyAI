import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export const DashboardHeader = () => {
  return (
    <View className="px-6 pt-10 pb-6">
      <Text className="text-3xl font-extrabold text-[#0F172A] mb-1">
        Good morning, Maria
      </Text>
      <Text className="text-lg text-[#475569] mb-2 leading-6">
        Here is your job listings statistic report from July 19 - July 25.
      </Text>
      
      <TouchableOpacity 
        activeOpacity={0.7}
        className="flex-row items-center justify-between border border-[#CBD5E1] rounded-xl px-4 py-4 bg-white"
      >
        <Text className="text-lg font-medium text-[#0F172A]">
          Jul 19 - Jul 25
        </Text>
        <MaterialCommunityIcons name="calendar" size={24} color="#4338CA" />
      </TouchableOpacity>
    </View>
  );
};