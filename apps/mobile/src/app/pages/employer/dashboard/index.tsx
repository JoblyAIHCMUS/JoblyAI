import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { DashboardHeader } from './components/DashboardHeader';
import { SummaryCards } from './components/SummaryCards';
import { JobStatisticsChart } from './components/JobStatisticsChart';
import { DetailedStatCards } from './components/DetailedStatCards';
import { ApplicantsSummary } from './components/ApplicantsSummary';
import { JobUpdatesList } from './components/JobUpdatesList';
import EmployerDashboardHeader from './components/EmployerDashboardHeader';

export default function EmployerDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pb-10">
          <DashboardHeader />
          <SummaryCards />
          <View className="h-[1px] bg-[#CBD5E1] mt-8" />
          <JobStatisticsChart />
          <DetailedStatCards />
          <View className="h-[1px] bg-[#CBD5E1] mt-8 mb-2" />
          <ApplicantsSummary />
          <View className="h-[1px] bg-[#CBD5E1] mt-2 mb-2" />
          <JobUpdatesList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
