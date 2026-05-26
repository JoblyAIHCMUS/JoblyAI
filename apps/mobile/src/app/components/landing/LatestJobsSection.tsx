import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LatestJobCard } from '../shared/LatestJobCard';
import { useListJobs } from '../../../hooks/useListJobs';

export const LatestJobsSection = () => {
  const { data, loading, error, fetchJobs } = useListJobs({ pageSize: 6 });

  // Helper to format employment type (e.g., FULL_TIME -> Full-Time)
  const formatType = (type: string) => {
    return type
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  };

  return (
    <View className="bg-app-background-1 py-8 px-6">
      <View className="mb-6">
        <Text className="text-4xl font-black text-app-text-1">
          Latest <Text className="text-app-primary-1">jobs open</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          className="text-app-primary-1 my-8"
        />
      ) : error ? (
        <View className="p-8 items-center justify-center">
          <Text className="text-app-red-3 mb-4">Failed to load jobs</Text>
          <TouchableOpacity
            onPress={() => fetchJobs()}
            className="bg-app-primary-1 py-2 px-6 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-4">
          {data?.jobs.map((job) => (
            <LatestJobCard
              key={job.id}
              title={job.title}
              company={job.company.name}
              logoUrl={job.company.logoUrl || undefined}
              location={job.location || (job.remote ? 'Remote' : 'On-site')}
              type={formatType(job.type)}
              tags={[
                job.category.name,
                ...(job.requirements?.[0]?.skillName
                  ? [job.requirements[0].skillName]
                  : []),
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default LatestJobsSection;
