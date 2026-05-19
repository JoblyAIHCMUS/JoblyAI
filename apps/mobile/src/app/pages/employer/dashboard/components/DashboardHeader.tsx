import React from 'react';
import { View, Text } from 'react-native';
import { useGetEmployerProfile } from '../../../../../hooks/useGetEmployerProfile';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardHeader = () => {
  const { data: employerProfile } = useGetEmployerProfile();
  const firstName = employerProfile?.fullName?.split(' ')[0] || 'User';
  const greeting = getGreeting();

  return (
    <View className="px-6 pt-10 pb-6">
      <Text className="text-3xl font-extrabold text-[#0F172A] mb-1">
        {greeting}, {firstName}
      </Text>
    </View>
  );
};
