import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeCheck, Mail, Pencil, Phone } from 'lucide-react-native';

import {
  InstagramIcon,
  TwitterIcon,
} from '../../../components/shared/svgs/Icons';
import CandidateDashboardSidebar from '../dashboard/components/CandidateDashboardSidebar';

function HeaderIcon({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="h-8 w-8 items-center justify-center rounded-full border border-[#dbe1ee] bg-white"
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-lg font-semibold tracking-[-0.2px] text-[#1f2937]">
        {title}
      </Text>
      {action}
    </View>
  );
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-xl border border-[#dbe1ee] bg-white ${className}`}
    >
      {children}
    </View>
  );
}

function SimpleMenu() {
  return (
    <View className="items-center justify-center">
      <View className="h-px w-4 rounded-full bg-[#1f2937]" />
      <View className="mt-1 h-px w-4 rounded-full bg-[#1f2937]" />
      <View className="mt-1 h-px w-4 rounded-full bg-[#1f2937]" />
    </View>
  );
}

function SimpleHome() {
  return (
    <View className="h-3 w-3 rounded-sm border border-[#1f2937]" />
  );
}

function SimpleBell() {
  return (
    <View className="relative h-3 w-3 rounded-t-full border border-[#1f2937]">
      <View className="absolute -bottom-1 left-1/2 h-0.5 w-1.5 -translate-x-1/2 rounded-full bg-[#1f2937]" />
    </View>
  );
}

function SimpleEdit() {
  return <Pencil size={12} color="#4f46e5" strokeWidth={2.4} />;
}

function SimpleLocation() {
  return (
    <View className="h-3 w-2 rounded-t-full rounded-b border border-[#667085]" />
  );
}

function SimpleFlag() {
  return <BadgeCheck size={14} color="#11a7a2" strokeWidth={2.2} />;
}

function SimpleMail() {
  return <Mail size={16} color="#667085" strokeWidth={2} />;
}

function SimplePhone() {
  return <Phone size={16} color="#667085" strokeWidth={2} />;
}

function SimplePlus() {
  return (
    <View className="items-center justify-center">
      <View className="h-2.5 w-0.5 rounded-full bg-[#4f46e5]" />
      <View className="absolute h-0.5 w-2.5 rounded-full bg-[#4f46e5]" />
    </View>
  );
}

function AvatarPhoto() {
  return (
    <View className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-[#dbeafe] shadow-lg">
      <Image
        source={{ uri: 'https://i.pravatar.cc/240?img=12' }}
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
  );
}

function SectionAction() {
  return (
    <HeaderIcon>
      <SimpleEdit />
    </HeaderIcon>
  );
}

export default function CandidatePublicProfileScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-3 pt-1">
          <View className="flex-row items-center justify-between pb-3">
            <View className="flex-row items-center gap-3">
              <HeaderIcon onPress={() => setIsSidebarOpen(true)}>
                <SimpleMenu />
              </HeaderIcon>
              <Text className="text-2xl font-semibold tracking-[-0.3px] text-[#111827]">
                My Profile
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <HeaderIcon>
                <SimpleHome />
              </HeaderIcon>
              <HeaderIcon>
                <View>
                  <SimpleBell />
                  <View className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#ff5f5f]" />
                </View>
              </HeaderIcon>
            </View>
          </View>
        </View>

        <View className="px-3">
          <View className="relative pt-14">
            <View className="absolute left-1/2 top-0 z-30 -ml-14">
              <AvatarPhoto />
            </View>

            <Card className="overflow-hidden">
              <View className="relative h-20 overflow-hidden bg-[#f6cbe0]">
                <View className="absolute left-0 top-0 h-full w-2/5 bg-[#f8d7ea]" />
                <View className="absolute left-1/3 top-0 h-20 w-20 rotate-[-22deg] bg-[#ebb5d5]" />
                <View className="absolute right-0 top-0 h-full w-1/3 bg-[#80508a]" />
                <View className="absolute right-12 top-0 h-full w-6 bg-[#a84f8d]" />
                <View className="absolute right-16 top-1 h-3 w-16 rounded-full bg-[#a56aa4] opacity-35" />

                <TouchableOpacity
                  activeOpacity={0.8}
                  className="absolute right-3 top-2.5 h-7 w-7 items-center justify-center rounded-sm border border-white/60 bg-transparent"
                >
                  <SimpleEdit />
                </TouchableOpacity>
              </View>

              <View className="items-start px-3 pb-3 pt-18">
                <Text className="text-2xl font-bold tracking-tight text-[#20263a]">
                  Jake Gyll
                </Text>
                <Text className="mt-1 text-sm font-medium text-[#6c7281]">
                  Product Designer at Twitter
                </Text>

                <View className="mt-1.5 flex-row items-center gap-2">
                  <SimpleLocation />
                  <Text className="text-sm font-medium text-[#5f6575]">
                    Manchester, UK
                  </Text>
                </View>

                <View className="mt-2 rounded-sm bg-[#d1f6ef] px-3 py-2">
                  <View className="flex-row items-center justify-center gap-2">
                    <SimpleFlag />
                    <Text className="text-sm font-medium tracking-wide text-[#11a7a2]">
                      OPEN FOR OPPORTUNITIES
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  className="mt-2.5 h-9 w-full items-center justify-center rounded-sm border border-[#d7ddfb] bg-white"
                >
                  <Text className="text-sm font-semibold text-[#5758e7]">
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </View>

        <View className="mt-5 px-3">
          <SectionHeader title="About Me" action={<SectionAction />} />
          <Card className="px-3 py-2.5">
            <Text className="text-sm leading-5 tracking-tight text-[#4c5466]">
              I&apos;m a product designer + filmmaker currently working remotely
              at Twitter from beautiful Manchester, United Kingdom. I&apos;m
              passionate about designing digital products that have a positive
              impact on the world.
            </Text>
            <Text className="mt-2.5 text-sm leading-5 tracking-tight text-[#4c5466]">
              For 10 years, I&apos;ve specialised in interface, experience &
              interaction design as well as working in user research and product
              strategy for product agencies, big tech companies & start-ups.
            </Text>
          </Card>
        </View>

        <View className="mt-5 px-3">
          <SectionHeader
            title="Experiences"
            action={
              <View className="flex-row items-center gap-2">
                <HeaderIcon>
                  <SimplePlus />
                </HeaderIcon>
                <SectionAction />
              </View>
            }
          />

          <Card className="px-3 py-2.5">
            <View className="flex-row gap-3 pb-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#1d9bf0]">
                <TwitterIcon />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold tracking-tight text-[#1f2535]">
                  Product Designer
                </Text>
                <Text className="mt-1 text-sm font-semibold text-[#4d5465]">
                  Twitter • Full-Time
                </Text>
                <Text className="mt-1 text-sm text-[#6b7280]">
                  Jun 2019 - Present
                </Text>
                <Text className="mt-0.5 text-sm text-[#6b7280]">
                  Manchester, UK
                </Text>
                <Text className="mt-1.5 text-sm leading-5 text-[#57606d]">
                  Created and executed social media plan for 10 brands utilizing
                  multiple features and content types to increase brand
                  outreach, engagement, and leads.
                </Text>
              </View>
            </View>

            <View className="my-2.5 h-px bg-[#dfe3f1]" />

            <View className="flex-row gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                <Text className="text-2xl font-black tracking-tight text-[#111111]">g</Text>
              </View>
              <View className="flex-1">
                <View className="absolute right-0 top-0">
                  <SectionAction />
                </View>
                <Text className="text-base font-bold tracking-tight text-[#1f2535]">
                  Growth Marketing Designer
                </Text>
                <Text className="mt-1 text-sm font-semibold text-[#4d5465]">
                  GoDaddy • Full-Time
                </Text>
                <Text className="mt-1 text-sm text-[#6b7280]">
                  Jun 2011 - May 2019
                </Text>
                <Text className="mt-0.5 text-sm text-[#6b7280]">
                  Manchester, UK
                </Text>
                <Text className="mt-1.5 text-sm leading-5 text-[#57606d]">
                  Developed digital marketing strategies, activation plans,
                  proposals, contests and promotions for client initiatives.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              className="mt-2.5 items-center"
            >
              <Text className="text-xs font-bold text-[#5758e7]">
                Show 3 more experiences
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View className="mt-5 px-3">
          <SectionHeader
            title="Educations"
            action={
              <View className="flex-row items-center gap-2">
                <HeaderIcon>
                  <SimplePlus />
                </HeaderIcon>
                <SectionAction />
              </View>
            }
          />

          <Card className="px-3 py-2.5">
            <View className="flex-row gap-3 pb-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#981b1e]">
                <Text className="text-xs font-bold text-white">
                  HARVARD
                </Text>
              </View>
              <View className="flex-1">
                <View className="absolute right-0 top-0">
                  <SectionAction />
                </View>
                <Text className="text-base font-bold tracking-[-0.2px] text-[#1f2535]">
                  Harvard University
                </Text>
                <Text className="mt-1 text-sm font-semibold text-[#4d5465]">
                  Postgraduate degree, Applied Psychology
                </Text>
                <Text className="mt-1 text-sm text-[#6b7280]">
                  2010 - 2012
                </Text>
                <Text className="mt-1.5 text-sm leading-5 text-[#57606d]">
                  As an Applied Psychologist in the field of Consumer and
                  Society, I am specialized in creating business opportunities
                  by observing, analysing, researching and changing behaviour.
                </Text>
              </View>
            </View>

            <View className="my-2.5 h-px bg-[#dfe3f1]" />

            <View className="flex-row gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#0d2f64]">
                <Text className="text-xs font-bold tracking-wide text-white">
                  TORONTO
                </Text>
              </View>
              <View className="flex-1">
                <View className="absolute right-0 top-0">
                  <SectionAction />
                </View>
                <Text className="text-base font-bold tracking-[-0.2px] text-[#1f2535]">
                  University of Toronto
                </Text>
                <Text className="mt-1 text-sm font-semibold text-[#4d5465]">
                  Bachelor of Arts, Visual Communication
                </Text>
                <Text className="mt-1 text-sm text-[#6b7280]">
                  2005 - 2009
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              className="mt-2.5 items-center"
            >
              <Text className="text-xs font-bold text-[#5758e7]">
                Show 2 more educations
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View className="mt-5 px-3">
          <SectionHeader
            title="Skills"
            action={
              <View className="flex-row items-center gap-2">
                <HeaderIcon>
                  <SimplePlus />
                </HeaderIcon>
                <SectionAction />
              </View>
            }
          />

          <Card className="px-3 py-2.5">
            <View className="flex-row flex-wrap gap-2">
              {[
                'Communication',
                'Analytics',
                'Facebook Ads',
                'Content Planning',
                'Community Manager',
              ].map((skill) => (
                <View
                  key={skill}
                  className="rounded-sm border border-[#dfe4fb] bg-[#f3f5ff] px-3 py-1.5"
                >
                  <Text className="text-xs font-medium text-[#4e5cf0]">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View className="mt-5 px-3">
          <SectionHeader
            title="Additional Details"
            action={<SectionAction />}
          />
          <Card className="px-3 py-3">
            <View className="flex-row items-center gap-3 py-2">
              <SimpleMail />
              <View>
                <Text className="text-xs font-medium text-[#556070]">
                  Email
                </Text>
                <Text className="mt-1 text-sm text-[#4e5cf0]">
                  jakegyll@email.com
                </Text>
              </View>
            </View>

            <View className="my-3 h-px bg-[#dfe3f1]" />

            <View className="flex-row items-center gap-3 py-2">
              <SimplePhone />
              <View>
                <Text className="text-xs font-medium text-[#556070]">
                  Phone
                </Text>
                <Text className="mt-1 text-sm text-[#1f2937]">
                  +44 1245 572 135
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View className="mt-5 px-3">
          <SectionHeader title="Social Links" action={<SectionAction />} />
          <Card className="px-3 py-3">
            <View className="flex-row items-center gap-3 py-2">
              <InstagramIcon />
              <View>
                <Text className="text-xs font-medium text-[#556070]">
                  Instagram
                </Text>
                <Text className="mt-1 text-sm text-[#4e5cf0]">
                  instagram.com/jakegyll
                </Text>
              </View>
            </View>

            <View className="my-3 h-px bg-[#dfe3f1]" />

            <View className="flex-row items-center gap-3 py-2">
              <TwitterIcon />
              <View>
                <Text className="text-xs font-medium text-[#556070]">
                  Twitter
                </Text>
                <Text className="mt-1 text-sm text-[#4e5cf0]">
                  twitter.com/jakegyll
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <CandidateDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath="/pages/candidate/public-profile"
      />
    </SafeAreaView>
  );
}
