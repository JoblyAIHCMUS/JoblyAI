import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

// Components
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import { JobsHeader } from './components/JobsHeader';
import { JobCard } from './components/JobCard';

// Data
import { MOCK_JOBS } from './data';

export default function EmployerJobListingScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <JobsHeader />

        <View className="px-4">
          <Text className="text-[19px] font-bold text-[#111827] mb-4">
            All jobs : {MOCK_JOBS.length}
          </Text>

          {MOCK_JOBS.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </View>
      </ScrollView>

      <EmployerDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
