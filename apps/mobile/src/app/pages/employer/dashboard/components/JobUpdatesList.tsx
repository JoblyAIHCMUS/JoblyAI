import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';
import { jobUpdates } from '../data/mockData';

export const JobUpdatesList = () => {
  return (
    <View className="px-4 py-4 mb-10">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Job Updates</Text>

      {jobUpdates.map((job) => (
        <View
          key={job.id}
          className="bg-white rounded-3xl p-5 border border-[#CBD5E1] shadow-sm mb-4"
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
            <View className="px-3 py-2 bg-[#EBF9F1] rounded-full">
              <Text className="font-medium text-sm text-[#56CDAD]">
                Full-Time
              </Text>
            </View>
          </View>

          <Text className="text-xl font-bold text-[#0F172A] mb-1">
            {job.title}
          </Text>
          <View className="flex-row items-center mb-4">
            <Text className="text-[#475569] text-base">{job.company}</Text>
            <Entypo name="dot-single" size={20} color="#475569" />
            <Text className="text-[#475569] text-base">{job.location}</Text>
          </View>

          <View className="flex-row gap-x-2 mb-4">
            {job.tags.map((tag, i) => (
              <View
                key={i}
                className="border border-[#7C8493] px-3 py-2 rounded-full"
              >
                <Text className="font-medium text-[#7C8493] text-sm">
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <View>
            <Text className="text-[#0F172A] font-bold mb-2 text-base">
              {job.applied} applied{' '}
              <Text className="font-normal text-[#475569] text-base">
                of {job.capacity} capacity
              </Text>
            </Text>
            <View className="h-2.5 bg-[#CBD5E1] rounded-full overflow-hidden">
              <View
                className="h-full bg-[#22C55E] rounded-full"
                style={{ width: `${(job.applied / job.capacity) * 100}%` }}
              />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity className="flex-row items-center justify-center py-4">
        <Text className="text-[#4338CA] font-bold text-lg mr-2">View All</Text>
        <Feather name="arrow-right" size={20} color="#4338CA" />
      </TouchableOpacity>
    </View>
  );
};
