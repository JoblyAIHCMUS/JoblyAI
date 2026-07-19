import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar } from 'lucide-react-native';

interface JobsHeaderProps {
  dateLabel: string;
  onDatePress: () => void;
}

export const JobsHeader = ({ dateLabel, onDatePress }: JobsHeaderProps) => {
  return (
    <View className="mb-6 pt-6 px-4">
      <Text className="text-3xl font-extrabold text-app-slate-1 mb-2">
        Job Listing
      </Text>
      <Text className="text-base text-app-text-3 mb-6 leading-6">
        Here is your jobs listing status for {dateLabel.toLowerCase()}.
      </Text>

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onDatePress}
          className="flex-1 flex-row items-center justify-between bg-white border border-app-gray-1 rounded-lg px-4 py-3 shadow-sm"
          activeOpacity={0.7}
        >
          <Text className="text-base text-app-gray-2 font-medium">
            {dateLabel}
          </Text>
          <Calendar size={20} color="#4640DE" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
