import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { JobListing } from '../data';

interface JobCardProps {
  job: JobListing;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const isLive = job.status === 'Live';
  
  return (
    <View className="bg-white rounded-xl border border-[#CBD5E1] p-4 mb-4 shadow-sm">
      {/* Top Row */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-[#0F172A] flex-1 mr-2" numberOfLines={1}>
          {job.title}
        </Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MoreHorizontal size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between mb-4 border-b border-[#F3F4F6] pb-4">
        <View>
          <Text className="text-lg text-[#475569] mb-1 font-medium">Date Posted</Text>
          <Text className="text-lg text-[#475569]">{job.datePosted}</Text>
        </View>
        <View>
          <Text className="text-lg text-[#475569] mb-1 font-medium">Applicants</Text>
          <Text className="text-lg text-[#475569]">{job.applicants}</Text>
        </View>
      </View>

      {/* Tags Row */}
      <View className="flex-row items-center gap-3">
        {/* Status Tag */}
        <View className={`px-4 py-1 rounded-full border ${isLive ? 'border-[#14B8A6]' : 'border-[#E11D48]'}`}>
          <Text className={`text-base font-semibold ${isLive ? 'text-[#14B8A6]' : 'text-[#E11D48]'}`}>
            {job.status}
          </Text>
        </View>

        {/* Type Tag */}
        <View className={`px-4 py-1 rounded-full border ${job.type === 'Fulltime' ? 'border-[#6366F1]' : 'border-[#EA580C]'}`}>
          <Text className={`text-base font-semibold ${job.type === 'Fulltime' ? 'text-[#6366F1]' : 'text-[#EA580C]'}`}>
            {job.type}
          </Text>
        </View>
      </View>
    </View>
  );
};
