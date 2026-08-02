import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';
import { jobUpdates } from '../data/mockData';
import { COLORS } from '../../../../constants/theme';

export const JobUpdatesList = () => {
  return (
    <View className="px-4 py-4 mb-10">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Job Updates</Text>

      {jobUpdates.map((job) => (
        <View
          key={job.id}
          className="bg-white rounded-3xl p-5 border border-app-border-2 shadow-sm mb-4"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${job.logoColor}20` }}
            >
              <View
                className="w-6 h-6 rounded-md"
                style={{ backgroundColor: job.logoColor }}
              />
            </View>
            <View className="px-3 py-2 bg-app-emerald-1 rounded-full">
              <Text className="font-medium text-sm text-app-emerald-2">
                Full-Time
              </Text>
            </View>
          </View>

          <Text className="text-xl font-bold text-app-slate-1 mb-1">
            {job.title}
          </Text>
          <View className="flex-row items-center mb-4">
            <Text className="text-app-text-3 text-base">{job.company}</Text>
            <Entypo name="dot-single" size={20} color={COLORS.textMuted} />
            <Text className="text-app-text-3 text-base">{job.location}</Text>
          </View>

          <View className="flex-row gap-x-2 mb-4">
            {job.tags.map((tag, i) => (
              <View
                key={i}
                className="border border-app-text-2 px-3 py-2 rounded-full"
              >
                <Text className="font-medium text-app-text-2 text-sm">
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <View>
            <Text className="text-app-slate-1 font-bold mb-2 text-base">
              {job.applied} applied{' '}
              <Text className="font-normal text-app-text-3 text-base">
                of {job.capacity} capacity
              </Text>
            </Text>
            <View className="h-2.5 bg-app-border-2 rounded-full overflow-hidden">
              <View
                className="h-full bg-app-green-1 rounded-full"
                style={{ width: `${(job.applied / job.capacity) * 100}%` }}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
