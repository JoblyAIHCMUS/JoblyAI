import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { MapPin, Briefcase, DollarSign } from 'lucide-react-native';
import type { JobPosting } from '../../../../../types/job';

interface JobCardProps {
  job: JobPosting;
  onPress?: () => void;
  onApplyPress?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress, onApplyPress }) => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 380);

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
      FULL_TIME: '#10b981',
      PART_TIME: '#3b82f6',
      INTERNSHIP: '#f59e0b',
      CONTRACT: '#8b5cf6',
      FREELANCE: '#ec4899',
    }[job.type] || '#6b7280';

  const salaryRange =
    job.salaryMin || job.salaryMax
      ? `${job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : ''} ${
          job.salaryMin && job.salaryMax ? '—' : ''
        } ${
          job.salaryMax
            ? `$${(job.salaryMax / 1000).toFixed(0)}k`
            : 'Competitive'
        }`
      : 'Not specified';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="mb-4 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-4 shadow-sm"
      style={{ width: cardWidth }}
    >
      {/* Header with logo and info */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center gap-3">
            {job.company.logoUrl ? (
              <Image
                source={{ uri: job.company.logoUrl }}
                className="h-10 w-10 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-[#e5e7eb]">
                <Briefcase size={20} color="#6b7280" />
              </View>
            )}
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-[#111827]"
                numberOfLines={1}
              >
                {job.company.name || 'Company'}
              </Text>
              <Text className="text-xs text-[#6b7280]">
                {job.category.name}
              </Text>
            </View>
          </View>

          <Text
            className="text-base font-bold text-[#111827]"
            numberOfLines={2}
          >
            {job.title}
          </Text>
        </View>
      </View>

      {/* Job details */}
      <View className="mb-3 space-y-2">
        {/* Location */}
        {job.location && (
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color="#6b7280" strokeWidth={2} />
            <Text className="text-sm text-[#6b7280]">{job.location}</Text>
            {job.remote && (
              <Text className="text-sm text-[#4f46e5]">• Remote</Text>
            )}
          </View>
        )}

        {/* Salary */}
        <View className="flex-row items-center gap-2">
          <DollarSign size={16} color="#6b7280" strokeWidth={2} />
          <Text className="text-sm text-[#6b7280]">{salaryRange}</Text>
        </View>

        {/* Employment type */}
        <View className="flex-row items-center gap-2">
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
        </View>
      </View>

      {/* Description preview */}
      {job.description && (
        <Text className="mb-3 text-sm text-[#6b7280]" numberOfLines={2}>
          {job.description.replace(/<[^>]*>/g, '')}
        </Text>
      )}

      {/* Apply button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onApplyPress}
        className="rounded-lg bg-[#4f46e5] py-3"
      >
        <Text className="text-center font-semibold text-white">Apply</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default JobCard;
