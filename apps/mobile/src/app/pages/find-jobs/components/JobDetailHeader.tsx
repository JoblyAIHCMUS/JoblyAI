import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ArrowLeft, Share } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/app/constants/theme';
import type { JobPosting } from '@/types/job';

interface JobDetailHeaderProps {
  job: JobPosting;
  hasApplied: boolean;
  onApply: () => void;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  hasApplied,
  onApply,
}) => {
  const router = useRouter();

  const employmentTypeLabel =
    {
      FULL_TIME: 'Full-Time',
      PART_TIME: 'Part-Time',
      INTERNSHIP: 'Internship',
      CONTRACT: 'Contract',
      FREELANCE: 'Freelance',
    }[job.type] || job.type;

  const handleShare = async () => {
    try {
      const { Share } = await import('react-native');
      await Share.share({
        message: `Check out this job: ${job.title} at ${
          job.company.name || 'Company'
        }`,
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <View className="bg-[#F8F8FD] px-4 py-6">
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-4 flex-row items-center gap-2"
      >
        <ArrowLeft size={20} color={COLORS.darkText} />
        <Text className="text-sm text-app-gray-3">Find Jobs</Text>
      </TouchableOpacity>

      {/* Job info card */}
      <View className="rounded-xl border border-app-gray-1 bg-white p-4 shadow-sm">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            {job.company.logoUrl ? (
              <Image
                source={{ uri: job.company.logoUrl }}
                className="h-14 w-14 rounded-lg"
                resizeMode="contain"
              />
            ) : (
              <View className="h-14 w-14 items-center justify-center rounded-lg bg-app-gray-1">
                <Text className="text-lg font-bold text-app-gray-3">
                  {(job.company.name || 'C')[0]}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xl font-bold text-app-dark-text">
                {job.title}
              </Text>
              <Text className="mt-1 text-sm text-app-gray-3">
                {job.company.name || 'Company'}
                {job.location ? ` • ${job.location}` : ''}
                {job.remote ? ' • Remote' : ''}
                {` • ${employmentTypeLabel}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleShare} className="ml-2 p-2">
            <Share size={20} color={COLORS.darkText} />
          </TouchableOpacity>
        </View>

        {/* Apply button */}
        <TouchableOpacity
          onPress={onApply}
          disabled={hasApplied}
          className={`mt-4 rounded-lg py-3 ${
            hasApplied ? 'bg-app-bg-disabled' : 'bg-app-primary-2'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              hasApplied ? 'text-app-text-placeholder' : 'text-white'
            }`}
          >
            {hasApplied ? 'Applied' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JobDetailHeader;
