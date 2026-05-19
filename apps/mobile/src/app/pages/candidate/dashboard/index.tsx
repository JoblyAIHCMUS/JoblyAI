import { useState } from 'react';
import { Stack } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  Menu,
  MessageCircleQuestion,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getGreetingName, useUser } from '../../../../hooks/useUser';
import CandidateDashboardSidebar from './components/CandidateDashboardSidebar';

const chartTabs = ['Status', 'Timeline'] as const;

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getCurrentWeekRangeLabel(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);

  return `${formatDate(start)} - ${formatDate(end)}`;
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <View className="overflow-hidden rounded-[14px] border border-[#d6ddeb] bg-white p-4">
      <View className="flex-row items-end justify-between gap-4">
        <View className="flex-1 pr-2">
          <Text className="text-[18px] font-semibold leading-6 text-[#25324b]">
            {label}
          </Text>
          <Text className="mt-6 text-[44px] font-medium leading-[56px] tracking-[-0.6px] text-[#25324b]">
            {value}
          </Text>
        </View>
        <View className="shrink-0 text-[#26a4ff]/30">{icon}</View>
      </View>
    </View>
  );
}

function StatusChartsSection() {
  return (
    <View className="w-full overflow-hidden rounded-[14px] border border-[#d6ddeb] bg-white p-4">
      <View className="flex-row self-start rounded-lg border border-[#d6ddeb] p-1">
        {chartTabs.map((tab) => {
          const active = tab === 'Status';

          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              className={`rounded-md px-3 py-1.5 ${active ? 'bg-[#eef0ff]' : 'bg-transparent'}`}
            >
              <Text
                className={`text-xs font-medium ${active ? 'text-[#4640de]' : 'text-[#7c8493]'}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-8 items-center">
        <Text className="self-start text-[18px] font-semibold leading-6 text-[#25324b]">
          Jobs Applied Status
        </Text>

        <View className="mt-8 h-[130px] w-[130px] items-center justify-center rounded-full border-[16px] border-[#e8ecff] bg-white shadow-[0_14px_30px_rgba(70,64,222,0.08)]" />

        <Text className="mt-10 text-sm text-[#7c8493]">
          No applications in current range.
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.7} className="mt-8 flex-row items-center self-start gap-2">
        <Text className="text-sm font-semibold text-[#4640de]">
          View All Applications
        </Text>
        <ChevronRight size={16} color="#4640de" />
      </TouchableOpacity>
    </View>
  );
}

function RecentApplicationsSection() {
  return (
    <View className="rounded-[14px] border border-[#d6ddeb] bg-white p-4">
      <Text className="pb-4 text-[18px] font-semibold leading-6 text-[#25324b]">
        Recent Applications History
      </Text>
      <View className="h-px w-full bg-[#d6ddeb]" />

      <View className="mt-6 min-h-[112px] rounded-[10px] bg-[#f8fafc] px-4 py-8">
        <Text className="text-center text-sm text-[#7c8493]">
          No applications found for this filter.
        </Text>
      </View>
    </View>
  );
}

export default function CandidateDashboard() {
  const { data: user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const greeting = getGreeting();
  const firstName = getGreetingName(user);
  const dateRangeLabel = getCurrentWeekRangeLabel();

  return (
    <SafeAreaView className="flex-1 bg-[#f9fbff]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="border-b border-[#d6ddeb] bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            className="p-2"
            onPress={() => setIsSidebarOpen(true)}
          >
            <Menu size={22} color="#25324b" />
          </TouchableOpacity>

          <Text className="text-[20px] font-bold text-[#25324b]">Dashboard</Text>

          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#eef0ff]">
              <Text className="text-sm font-bold text-[#4640de]">
                {(firstName || 'U').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="relative p-2">
              <Bell size={22} color="#25324b" />
              <View className="absolute right-1 top-1 h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b5a] px-1">
                <Text className="text-[10px] font-bold leading-3 text-white">9</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="gap-4 px-4 py-4">
          <View>
            <Text className="text-[28px] font-bold leading-8 text-[#25324b]">
              {greeting}, {firstName}
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#7c8493]">
              Here is what's happening with your job search applications from{' '}
              {dateRangeLabel}.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-between rounded-[8px] border border-[#d6ddeb] bg-white px-3 py-3"
          >
            <Text className="text-sm font-medium text-[#25324b]">
              {dateRangeLabel}
            </Text>
            <CalendarDays size={18} color="#4640de" />
          </TouchableOpacity>

          <StatCard
            label="Total Jobs Applied"
            value={0}
            icon={<FileText size={48} color="#26a4ff" strokeWidth={1.4} />}
          />

          <StatCard
            label="Interviewed"
            value={0}
            icon={<MessageCircleQuestion size={48} color="#26a4ff" strokeWidth={1.4} />}
          />

          <StatusChartsSection />

          <RecentApplicationsSection />
        </View>
      </ScrollView>

      <CandidateDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}