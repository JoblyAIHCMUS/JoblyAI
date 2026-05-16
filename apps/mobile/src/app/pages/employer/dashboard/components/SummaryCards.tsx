import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const SummaryCards = () => {
  return (
    <View className="px-4 gap-y-3">
      <TouchableOpacity
        style={{ backgroundColor: '#4F46E5' }}
        className="rounded-2xl p-6 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-x-4 flex-1">
          <Text className="text-white text-5xl font-bold">76</Text>
          <Text className="text-white text-xl font-medium flex-1">New candidates to review</Text>
        </View>
        <MaterialIcons name="chevron-right" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: '#0EA5E9' }}
        className="rounded-2xl p-6 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-x-4 flex-1">
          <Text className="text-white text-5xl font-bold">24</Text>
          <Text className="text-white text-xl font-medium flex-1">Messages received</Text>
        </View>
        <MaterialIcons name="chevron-right" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};