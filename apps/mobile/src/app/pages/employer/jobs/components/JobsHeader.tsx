import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, SlidersHorizontal } from 'lucide-react-native';

export const JobsHeader = () => {
  return (
    <View className="mb-6 pt-6 px-4">
      <Text className="text-3xl font-extrabold text-app-slate-1 mb-2">
        Job Listing
      </Text>
      <Text className="text-base text-app-text-3 mb-6 leading-6">
        Here is your jobs listing status from July 19 - July 25.
      </Text>

      {/* Controls Row */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-between bg-white border border-app-gray-1 rounded-lg px-4 py-3 shadow-sm"
          activeOpacity={0.7}
        >
          <Text className="text-base text-app-gray-2 font-medium">
            Jul 19 - Jul 25
          </Text>
          <Calendar size={20} color="#4640DE" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-white border border-app-gray-1 rounded-lg px-5 py-3 shadow-sm"
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={24} color="#0F172A" />
          <Text className="ml-2 text-base text-app-slate-1 font-semibold">
            Filters
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
