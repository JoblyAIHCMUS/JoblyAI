import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MapPin, DollarSign, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/app/constants/theme';
import type { JobPosting } from '@/types/job';
import { formatCompactSalary } from '../utils';

interface JobCardProps {
  job: JobPosting;
  onPress?: () => void;
  hasApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress, hasApplied }) => {
  const router = useRouter();
  const [logoFailed, setLogoFailed] = useState(false);

  const employmentTypeLabel =
    {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      INTERNSHIP: 'Internship',
      CONTRACT: 'Contract',
      FREELANCE: 'Freelance',
    }[job.type] || job.type;

  const employmentTypeColor =
    {
      FULL_TIME: COLORS.typeFullTime,
      PART_TIME: COLORS.typePartTime,
      INTERNSHIP: COLORS.typeInternship,
      CONTRACT: COLORS.typeContract,
      FREELANCE: COLORS.typeFreelance,
    }[job.type] || COLORS.gray3;

  const salaryRange = formatCompactSalary(
    job.salaryMin,
    job.salaryMax,
    job.currency
  );

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/pages/find-jobs/${job.id}`);
    }
  };

  const matchBadge =
    job.matchPercentage != null ? (
      <View
        className={`flex-row items-center gap-1 rounded-full border px-2 py-0.5 ${
          job.matchPercentage >= 80
            ? 'border-green-200 bg-green-50'
            : job.matchPercentage >= 50
            ? 'border-blue-200 bg-blue-50'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <Star
          size={10}
          color={
            job.matchPercentage >= 80
              ? COLORS.successDark
              : job.matchPercentage >= 50
              ? COLORS.infoText
              : COLORS.textMuted
          }
          fill={
            job.matchPercentage >= 80
              ? COLORS.successDark
              : job.matchPercentage >= 50
              ? COLORS.infoText
              : COLORS.textMuted
          }
        />
        <Text
          className={`text-[10px] font-semibold ${
            job.matchPercentage >= 80
              ? 'text-green-700'
              : job.matchPercentage >= 50
              ? 'text-blue-700'
              : 'text-slate-600'
          }`}
        >
          {Math.round(job.matchPercentage)}% Match
        </Text>
      </View>
    ) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      className="mb-4 rounded-2xl border border-app-gray-1 bg-white px-4 py-4 shadow-sm"
    >
      {/* Header with logo and info */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center gap-3">
            {job.company.logoUrl && !logoFailed ? (
              <Image
                source={{ uri: job.company.logoUrl }}
                className="h-10 w-10 rounded-lg"
                resizeMode="cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <View className="h-10 w-10 rounded-lg bg-app-gray-1" />
            )}
            <View className="flex-1">
              <Text
                className="text-base font-semibold text-primary"
                numberOfLines={1}
              >
                {job.company.name || 'Company'}
              </Text>
              <Text className="text-xs text-app-gray-3">
                {job.category.name}
              </Text>
            </View>
          </View>

          {/* Salary */}
          <View className="mb-2 flex-row items-center gap-2">
            <DollarSign size={16} color={COLORS.primary2} strokeWidth={2} />
            <Text className="text-sm font-bold text-app-primary-2">
              {salaryRange}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text
              className="flex-1 text-base font-bold text-app-dark-text"
              numberOfLines={2}
            >
              {job.title}
            </Text>
            {matchBadge}
          </View>
        </View>
      </View>

      {/* Job details */}
      <View className="mb-3 space-y-2">
        {/* Location */}
        {job.location && (
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color={COLORS.gray3} strokeWidth={2} />
            <Text className="text-sm text-app-gray-3">{job.location}</Text>
            {job.remote && (
              <Text className="text-sm text-app-primary-2">• Remote</Text>
            )}
          </View>
        )}

        {/* Employment type and category */}
        <View className="flex-row flex-wrap items-center gap-2">
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: `${employmentTypeColor}20` }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: employmentTypeColor }}
            >
              {employmentTypeLabel}
            </Text>
          </View>
          <View className="rounded-full border border-app-primary-2 px-2 py-1">
            <Text className="text-xs font-semibold text-app-primary-2">
              {job.category.name}
            </Text>
          </View>
        </View>
      </View>

      {/* Description preview */}
      {job.description && (
        <Text className="mb-3 text-sm text-app-gray-3" numberOfLines={2}>
          {job.description.replace(/<[^>]*>/g, '')}
        </Text>
      )}

      {/* Apply button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        className={`rounded-lg py-3 ${
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
    </TouchableOpacity>
  );
};

export default JobCard;
