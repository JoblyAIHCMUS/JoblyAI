'use client';

import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  CheckCircle2,
  Coffee,
  Dot,
  HeartHandshake,
  Mountain,
  MoreHorizontal,
  Palmtree,
  SquarePen,
  Stethoscope,
  Train,
  Video,
} from 'lucide-react-native';

import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';

type TabName = 'Applicants' | 'Job Details' | 'Analytics';

const tabs: TabName[] = ['Applicants', 'Job Details', 'Analytics'];

const responsibilities = [
  'Community engagement to ensure that is supported and actively represented online',
  'Focus on social media content development and publication',
  'Marketing and strategy support',
  'Stay on top of trends on social media platforms, and suggest content ideas to the team',
  'Engage with online communities',
];

const whoYouAre = [
  'You get energy from people and building the ideal work environment',
  'You have a sense for beautiful spaces and office experiences',
  'You are a confident office manager, ready for added responsibilities',
  "You're detail-oriented and creative",
  "You're a growth marketer and know how to run campaigns",
];

const niceToHaves = ['Fluent in English', 'Project management skills', 'Copy editing skills'];

const benefits = [
  {
    icon: Stethoscope,
    title: 'Full Healthcare',
    description:
      'We believe in thriving communities and that starts with our team being happy and healthy.',
  },
  {
    icon: Palmtree,
    title: 'Unlimited Vacation',
    description:
      'We believe you should have a flexible schedule that makes space for family, wellness, and fun.',
  },
  {
    icon: Video,
    title: 'Skill Development',
    description:
      "We believe in always learning and leveling up our skills. Whether it's a conference or online course.",
  },
  {
    icon: Mountain,
    title: 'Team Summits',
    description:
      'Every 6 months we have a full team summit where we have fun, reflect, and plan for the upcoming quarter.',
  },
  {
    icon: Coffee,
    title: 'Remote Working',
    description:
      'You know how you perform your best. Work from home, coffee shop or anywhere when you feel like it.',
  },
  {
    icon: Train,
    title: 'Commuter Benefits',
    description:
      "We're grateful for all the time and energy each team member puts into getting to work every day.",
  },
  {
    icon: HeartHandshake,
    title: 'We give back.',
    description:
      'We anonymously match any donation our employees make (up to $/€ 600) so they can support the organizations they care about most-times two.',
  },
];

function Divider() {
  return <View className="my-5 h-px bg-[#dbe1ee]" />;
}

function SectionTitle({ title }: { title: string }) {
  return <Text className="text-2xl font-semibold tracking-[-0.4px] text-[#111827]">{title}</Text>;
}

function ChecklistItem({ children }: { children: string }) {
  return (
    <View className="mb-3 flex-row items-start">
      <CheckCircle2 size={18} color="#22c55e" strokeWidth={2.2} style={{ marginTop: 2 }} />
      <Text className="ml-3 flex-1 text-base leading-6 text-[#4b5563]">{children}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="text-base text-[#667085]">{label}</Text>
      <Text className="text-base font-semibold text-[#111827]">{value}</Text>
    </View>
  );
}

function Pill({
  label,
  backgroundColor,
  color,
}: {
  label: string;
  backgroundColor: string;
  color: string;
}) {
  return (
    <View className="rounded-full px-3 py-1.5" style={{ backgroundColor }}>
      <Text className="text-sm font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function BenefitItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description: string;
}) {
  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center">
        <Icon size={20} color="#4F46E5" strokeWidth={2.2} />
        <Text className="ml-3 text-base font-bold tracking-[-0.2px] text-[#111827]">
          {title}
        </Text>
      </View>
      <Text className="text-base leading-6 text-[#4b5563]">{description}</Text>
    </View>
  );
}

export default function JobDetailsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>('Job Details');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <EmployerDashboardHeader />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          activeOpacity={0.8}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={32} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreHorizontal size={32} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View className="px-4 pb-3">
        <Text className="text-2xl font-semibold tracking-[-0.7px] text-[#0F172A]">
          Social Media Assistant
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text className="text-xl font-medium text-[#0F172A]">Design</Text>
          <Dot size={28} color="#0F172A" style={{ marginHorizontal: 4 }} />
          <Text className="text-xl font-medium text-[#0F172A]">Full-Time</Text>
        </View>
      </View>

      <View className="flex-row justify-between border-b border-app-border-2 px-4" pointerEvents="box-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return isActive ? (
            <View key={tab} className="border-b-2 border-app-primary-2 pb-2">
              <TouchableOpacity activeOpacity={0.85} onPress={() => setActiveTab(tab)}>
                <Text className="text-app-primary-2 font-semibold text-lg">{tab}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.85}
              onPress={() => setActiveTab(tab)}
              className="pb-2"
            >
              <Text className="text-app-text-3 font-semibold text-lg">{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-1 bg-white">
        {activeTab === 'Job Details' ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}
          >
            <View className="rounded-2xl border border-[#dbe1ee] bg-white p-4">
              <View className="mb-6 flex-row items-start justify-between">
                <View
                  className="h-[52px] w-[52px] items-center justify-center rounded-2xl"
                  style={{ backgroundColor: '#5B5CE7' }}
                >
                  <Text className="text-4xl font-bold text-white">S</Text>
                </View>

                <TouchableOpacity activeOpacity={0.8} className="p-2">
                  <SquarePen size={28} color="#4F46E5" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <Text className="text-4xl font-semibold leading-tight tracking-tight text-[#111827]">
                Social Media Assistant
              </Text>
            </View>

            <View className="mt-6">
              <SectionTitle title="Description" />
              <Text className="mt-4 text-base font-normal leading-6 text-[#0F172A]">
                Stripe is looking for Social Media Marketing expert to help manage our online networks.
                You will be responsible for monitoring our social media channels, creating content,
                finding effective ways to engage the community and incentivize others to engage on
                our channels.
              </Text>
            </View>

            <Divider />

            <View>
              <SectionTitle title="Responsibilities" />
              <View className="mt-4">
                {responsibilities.map((item) => (
                  <ChecklistItem key={item}>{item}</ChecklistItem>
                ))}
              </View>
            </View>

            <Divider />

            <View>
              <SectionTitle title="Who You Are" />
              <View className="mt-4">
                {whoYouAre.map((item) => (
                  <ChecklistItem key={item}>{item}</ChecklistItem>
                ))}
              </View>
            </View>

            <Divider />

            <View>
              <SectionTitle title="Nice-To-Haves" />
              <View className="mt-4">
                {niceToHaves.map((item) => (
                  <ChecklistItem key={item}>{item}</ChecklistItem>
                ))}
              </View>
            </View>

            <Divider />

            <View>
              <SectionTitle title="About this role" />

              <Text className="mt-4 text-base font-semibold text-[#111827]">
                5 applied <Text className="font-normal text-[#667085]">of 10 capacity</Text>
              </Text>

              <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#e6ebf2]">
                <View className="h-full w-1/2 rounded-full bg-[#10b981]" />
              </View>

              <View className="mt-6">
                <DetailRow label="Apply Before" value="July 31, 2021" />
                <DetailRow label="Job Posted On" value="July 1, 2021" />
                <DetailRow label="Job Type" value="Full-Time" />
                <DetailRow label="Salary" value="$75k-$85k USD" />
              </View>
            </View>

            <Divider />

            <View>
              <SectionTitle title="Categories" />
              <View className="mt-4 flex-row flex-wrap gap-2">
                <Pill label="Marketing" backgroundColor="#FFF2E5" color="#F97316" />
                <Pill label="Design" backgroundColor="#DDFAF4" color="#10B981" />
              </View>
            </View>

            <Divider />

            <View>
              <SectionTitle title="Required Skills" />
              <View className="mt-4 flex-row flex-wrap gap-2">
                {['Project Management', 'Copywriting', 'Social Media Marketing', 'English', 'Copy Editing'].map(
                  (skill) => (
                    <Pill key={skill} label={skill} backgroundColor="#EEEDFC" color="#4F46E5" />
                  )
                )}
              </View>
            </View>

            <Divider />

            <View>
              <SectionTitle title="Perks & Benefits" />
              <Text className="mt-2 text-base leading-6 text-[#4b5563]">
                This job comes with several perks and benefits
              </Text>

              <View className="mt-5">
                {benefits.map((benefit) => (
                  <BenefitItem
                    key={benefit.title}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
         ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base text-[#667085]">This tab is empty for now.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
