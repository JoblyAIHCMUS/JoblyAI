import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SummaryCardsProps {
  candidateCount?: number;
  messageCount?: number;
  loading?: boolean;
}

export const SummaryCards = ({
  candidateCount = 0,
  messageCount = 0,
  loading = false,
}: SummaryCardsProps) => {
  return (
    <View className="px-4 gap-y-3">
      <TouchableOpacity className="rounded-2xl p-6 flex-row items-center justify-between bg-app-primary-2">
        <View className="flex-row items-center gap-x-4 flex-1">
          {loading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <Text className="text-white text-5xl font-bold">
              {candidateCount}
            </Text>
          )}
          <Text className="text-white text-xl font-medium flex-1">
            New candidates to review
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity className="rounded-2xl p-6 flex-row items-center justify-between bg-app-secondary-2">
        <View className="flex-row items-center gap-x-4 flex-1">
          {loading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <Text className="text-white text-5xl font-bold">
              {messageCount}
            </Text>
          )}
          <Text className="text-white text-xl font-medium flex-1">
            Messages received
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};
