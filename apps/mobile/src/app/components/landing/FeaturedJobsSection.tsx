import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FeaturedJobCard } from '../shared/FeaturedJobCard';
import { ArrowRightIconPrimary } from '../shared/svgs/Icons';
import type { PaginatedJobsResponse } from '../../../types/job';

interface FeaturedJobsSectionProps {
  data: PaginatedJobsResponse | null;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export const FeaturedJobsSection = ({
  data,
  loading,
  error,
  onRetry,
}: FeaturedJobsSectionProps) => {
  const jobs = data?.jobs ?? [];

  const scrollContent = {
    paddingLeft: 24,
    paddingRight: 8,
  };

  return (
    <View className="bg-app-white-1 py-8">
      <View className="flex-row justify-between items-center mb-6 px-6">
        <Text className="text-4xl font-black text-app-text-1">
          Featured <Text className="text-app-primary-1">jobs</Text>
        </Text>
      </View>

      {loading && jobs.length === 0 ? (
        <View className="h-[200px] justify-center items-center">
          <ActivityIndicator size="large" className="text-app-primary-1" />
        </View>
      ) : error && jobs.length === 0 ? (
        <View className="h-[200px] justify-center items-center">
          <Text className="text-app-red-3 mb-4">
            Failed to load featured jobs
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            className="bg-app-primary-1 py-2 px-6 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={scrollContent}
          >
            {jobs.map((job) => (
              <FeaturedJobCard
                key={job.id}
                title={job.title}
                company={job.company.name}
                location={job.location || (job.remote ? 'Remote' : 'On-site')}
                description={job.description}
                logoUrl={job.company.logoUrl || undefined}
                tags={job.requirements.slice(0, 2).map((r) => r.skillName)}
              />
            ))}
          </ScrollView>
          <TouchableOpacity
            className="flex-row items-center gap-1 mt-6 px-6"
            activeOpacity={0.7}
          >
            <Text className="text-lg font-bold text-app-primary-1">
              Show all jobs
            </Text>
            <ArrowRightIconPrimary />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default FeaturedJobsSection;
