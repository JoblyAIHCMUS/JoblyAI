import React from 'react';
import { View, Text } from 'react-native';
import { useUser, getGreetingName } from '../../../../../hooks/useUser';

export const DashboardHeader = () => {
  const { data: user } = useUser();
  const firstName = getGreetingName(user);

  return (
    <View className="px-6 pt-10 pb-6">
      <Text className="text-3xl font-extrabold text-[#0F172A] mb-1">
        Good morning, {firstName}
      </Text>
    </View>
  );
};
