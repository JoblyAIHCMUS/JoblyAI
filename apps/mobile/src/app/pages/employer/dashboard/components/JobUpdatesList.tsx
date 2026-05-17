import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { jobUpdates } from '../data/mockData';

export const JobUpdatesList = () => {
  return (
    <View className="px-4 py-4 mb-10">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Job Updates</Text>

      {jobUpdates.map((job) => (
        <View key={job.id} className="bg-white rounded-3xl p-5 border border-[#CBD5E1] shadow-sm mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: `${job.logoColor}20` }}>
               <View className="w-6 h-6 rounded-md" style={{ backgroundColor: job.logoColor }} />
            </View>
            <View className="bg-cyan-100 px-3 py-1 rounded-full">
              <Text className="text-cyan-600 font-medium text-xs">Full-Time</Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-1">{job.title}</Text>
          <Text className="text-gray-500 mb-4">{job.company} • {job.location}</Text>

          <View className="flex-row gap-x-2 mb-6">
            {job.tags.map((tag, i) => (
              <View key={i} className="border border-orange-400 px-4 py-1.5 rounded-full">
                <Text className="text-orange-500 font-medium">{tag}</Text>
              </View>
            ))}
          </View>

          <View>
            <Text className="text-gray-900 font-bold mb-2">
              {job.applied} applied <Text className="font-normal text-gray-500">of {job.capacity} capacity</Text>
            </Text>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View className="h-full bg-green-500 rounded-full" style={{ width: `${(job.applied / job.capacity) * 100}%` }} />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity className="items-center py-4">
        <Text className="text-indigo-600 font-bold text-lg">View All →</Text>
      </TouchableOpacity>
    </View>
  );
};