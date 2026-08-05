import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase } from 'lucide-react-native';
import { COLORS } from '@/app/constants/theme';
import type { JobPosting } from '@/types/job';

interface SimilarJobsProps {
  jobs: JobPosting[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

const SimilarJobCard: React.FC<{ job: JobPosting; onPress: () => void }> = ({
  job,
  onPress,
}) => {
  const employmentTypeLabel =
    {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      INTERNSHIP: 'Internship',
      CONTRACT: 'Contract',
      FREELANCE: 'Freelance',
    }[job.type] || job.type;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-3 w-56 rounded-xl border border-app-gray-1 bg-white p-3 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="mb-2 flex-row items-center gap-2">
        {job.company.logoUrl ? (
          <Image
            source={{ uri: job.company.logoUrl }}
            className="h-10 w-10 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-app-gray-1">
            <Briefcase size={18} color={COLORS.gray3} />
          </View>
        )}
        <View className="flex-1">
          <Text
            className="text-sm font-semibold text-app-dark-text"
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <Text className="text-xs text-app-gray-3" numberOfLines={1}>
            {job.company.name || 'Company'}
            {job.location ? ` • ${job.location}` : ''}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <View className="rounded-full bg-emerald-100 px-2 py-1">
          <Text className="text-xs font-semibold text-emerald-600">
            {employmentTypeLabel}
          </Text>
        </View>
        {job.category && (
          <View className="rounded-full bg-indigo-50 px-2 py-1">
            <Text className="text-xs font-semibold text-indigo-600">
              {job.category.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SimilarJobs: React.FC<SimilarJobsProps> = ({
  jobs,
  loading,
  error,
  onRetry,
}) => {
  const router = useRouter();

  if (loading && jobs.length === 0) {
    return (
      <View className="px-4 py-6">
        <Text className="mb-3 text-lg font-bold text-app-dark-text">
          Similar Jobs
        </Text>
        <View className="flex-row gap-3">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="h-24 w-56 animate-pulse rounded-xl bg-app-gray-1"
            />
          ))}
        </View>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View className="px-4 py-6">
        <Text className="mb-3 text-lg font-bold text-app-dark-text">
          Similar Jobs
        </Text>
        <Text className="mb-3 text-sm text-app-gray-3">
          Failed to load similar jobs.
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          className="self-start rounded-lg bg-app-primary-1 px-4 py-2"
        >
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <View className="px-4 py-6">
      <Text className="mb-3 text-lg font-bold text-app-dark-text">
        Similar Jobs
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {jobs.map((job) => (
          <SimilarJobCard
            key={job.id}
            job={job}
            onPress={() => router.push(`/pages/find-jobs/${job.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default SimilarJobs;
