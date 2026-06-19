import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import { parseDescription, formatSalary, formatJobType, formatDate } from '../utils';
import type { JobPosting } from '../../../../../types/job';
import RequiredSkills from './RequiredSkills';

interface JobDetailContentProps {
  job: JobPosting;
}

const JobDetailContent: React.FC<JobDetailContentProps> = ({ job }) => {
  const descriptionContent = parseDescription(job.description);
  const formattedSalary = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  const jobTypeLabel = formatJobType(job.type);

  const renderSection = (title: string, items: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View className="mb-6">
        <Text className="mb-3 text-lg font-bold text-app-dark-text">
          {title}
        </Text>
        {items.map((item, index) => (
          <View key={index} className="mb-2 flex-row items-start gap-2">
            <CheckCircle2
              size={18}
              color={COLORS.typeFullTime}
              className="mt-0.5"
            />
            <Text className="flex-1 text-sm leading-5 text-app-gray-3">
              {item.replace(/<[^>]*>/g, '')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOverview = (html: string) => {
    if (!html) return null;
    const cleanText = html.replace(/<[^>]*>/g, '');
    return (
      <View className="mb-6">
        <Text className="mb-3 text-lg font-bold text-app-dark-text">
          Description
        </Text>
        <Text className="text-sm leading-5 text-app-gray-3">{cleanText}</Text>
      </View>
    );
  };

  return (
    <View className="px-4 py-6">
      {/* Left column: Description sections */}
      <View className="mb-6">
        {renderOverview(descriptionContent.overview)}
        {renderSection('Responsibilities', descriptionContent.responsibilities)}
        {renderSection('Who You Are', descriptionContent.whoYouAre)}
        {renderSection('Nice-to-Haves', descriptionContent.niceToHaves)}
      </View>

      {/* Right column: About this role */}
      <View className="mb-6 rounded-xl border border-app-gray-1 bg-white p-4">
        <Text className="mb-4 text-lg font-bold text-app-dark-text">
          About This Role
        </Text>

        <View className="mb-3 flex-row items-center justify-between border-b border-app-gray-1 pb-3">
          <Text className="text-sm text-app-gray-3">Apply Before</Text>
          <Text className="text-sm font-medium text-app-dark-text">
            {formatDate(job.updatedAt)}
          </Text>
        </View>

        <View className="mb-3 flex-row items-center justify-between border-b border-app-gray-1 pb-3">
          <Text className="text-sm text-app-gray-3">Job Posted On</Text>
          <Text className="text-sm font-medium text-app-dark-text">
            {formatDate(job.createdAt)}
          </Text>
        </View>

        <View className="mb-3 flex-row items-center justify-between border-b border-app-gray-1 pb-3">
          <Text className="text-sm text-app-gray-3">Job Type</Text>
          <Text className="text-sm font-medium text-app-dark-text">
            {jobTypeLabel}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-app-gray-3">Salary</Text>
          <Text className="text-sm font-medium text-app-dark-text">
            {formattedSalary}
          </Text>
        </View>
      </View>

      {/* Category */}
      <View className="mb-6">
        <Text className="mb-2 text-lg font-bold text-app-dark-text">
          Category
        </Text>
        <View className="self-start rounded-full bg-teal-100 px-3 py-1">
          <Text className="text-sm font-medium text-teal-600">
            {job.category.name}
          </Text>
        </View>
      </View>

      {/* Required Skills */}
      {job.requirements && job.requirements.length > 0 && (
        <RequiredSkills requirements={job.requirements} />
      )}
    </View>
  );
};

export default JobDetailContent;
