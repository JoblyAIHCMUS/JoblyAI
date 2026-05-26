import React from 'react';
import { View, Text } from 'react-native';
import { IconInput } from '../shared/IconInput';
import { AppButton } from '../shared/AppButton';
import {
  SearchIcon,
  PinIcon,
  ChevronIcon,
  SquigglyLines,
} from '../shared/svgs/Icons';

const handleNoop = (): void => {
  // No-op for handlers to satisfy ESLint
};

const HeroSection: React.FC = () => {
  return (
    <View className="bg-app-background-1 py-8 px-6">
      <View className="mt-4">
        <View className="mb-4 relative">
          <Text className="text-4xl font-black text-app-text-1 leading-12">
            Discover more than{' '}
            <Text className="text-app-primary-1">5000+ Jobs</Text>
          </Text>
          <View className="mt-1">
            <SquigglyLines />
          </View>
        </View>

        <Text className="text-xl font-medium text-app-text-3 leading-6 mb-8">
          Great platform for the job seeker that searching for new career
          heights and passionate about startups.
        </Text>

        <View className="bg-app-white-1 p-6 rounded-xl shadow-md mb-6">
          <IconInput
            icon={<SearchIcon />}
            placeholder="Job title or keyword"
            value=""
            onChangeText={handleNoop}
          />
          <View className="relative">
            <IconInput
              icon={<PinIcon />}
              placeholder="Florence, Italy"
              value=""
              onChangeText={handleNoop}
            />
            <View className="absolute right-0 top-3">
              <ChevronIcon />
            </View>
          </View>
          <AppButton title="Search my job" onPress={handleNoop} />
        </View>

        <View className="mt-2">
          <Text className="text-base font-semibold text-app-text-3">
            Popular :{' '}
            <Text className="font-normal">
              UI Designer, UX Researcher, Android, Admin
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HeroSection;
