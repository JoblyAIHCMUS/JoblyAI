import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import {
  normalizeDescriptionHtml,
  formatSalary,
  formatJobType,
  formatDate,
} from '../utils';
import type { JobPosting } from '@/types/job';
import RequiredSkills from './RequiredSkills';
import { COLORS } from '@/app/constants/theme';

const htmlTagStyles: Record<string, Record<string, unknown>> = {
  body: {
    color: COLORS.gray3,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 0,
    marginBottom: 0,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: COLORS.darkText,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
    color: COLORS.darkText,
  },
  p: { marginBottom: 8 },
  ul: { paddingLeft: 8 },
  ol: { paddingLeft: 8 },
  li: { marginBottom: 2 },
  strong: { fontWeight: '700' },
  em: { fontStyle: 'italic' },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.borderMuted,
    paddingLeft: 12,
    fontStyle: 'italic',
    color: COLORS.textMuted,
  },
  code: {
    backgroundColor: COLORS.slateGray,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  pre: {
    backgroundColor: COLORS.slateGray,
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
};

const ignoredDomTags = [
  'script',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'style',
];

interface JobDetailContentProps {
  job: JobPosting;
}

const JobDetailContent: React.FC<JobDetailContentProps> = ({ job }) => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(width - 32, 1);
  const formattedSalary = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.currency
  );
  const jobTypeLabel = formatJobType(job.type);

  return (
    <View className="px-4 py-6">
      {/* About this role */}
      <View className="mb-6 rounded-xl border border-app-gray-1 bg-white p-4">
        <Text className="mb-4 text-lg font-bold text-app-dark-text">
          About This Role
        </Text>

        <View className="mb-3 flex-row items-center justify-between border-b border-app-gray-1 pb-3">
          <Text className="text-sm text-app-gray-3">Salary</Text>
          <Text className="text-base font-bold text-app-primary-2">
            {formattedSalary}
          </Text>
        </View>

        <View className="mb-3 flex-row items-center justify-between border-b border-app-gray-1 pb-3">
          <Text className="text-sm text-app-gray-3">Job Type</Text>
          <Text className="text-sm font-medium text-app-dark-text">
            {jobTypeLabel}
          </Text>
        </View>

        <View className="mb-3 flex-row items-center justify-between border-b border-app-gray-1 pb-3">
          <Text className="text-sm text-app-gray-3">Last Updated</Text>
          <Text className="text-sm font-medium text-app-dark-text">
            {formatDate(job.updatedAt)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-app-gray-3">Job Posted On</Text>
          <Text className="text-sm font-medium text-app-dark-text">
            {formatDate(job.createdAt)}
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

      {/* Description */}
      <View className="mb-6">
        <Text className="mb-3 text-lg font-bold text-app-dark-text">
          Description
        </Text>
        {job.description ? (
          <RenderHtml
            contentWidth={contentWidth}
            source={{ html: normalizeDescriptionHtml(job.description) }}
            tagsStyles={htmlTagStyles}
            ignoredDomTags={ignoredDomTags}
          />
        ) : null}
      </View>

      {/* Required Skills */}
      {job.requirements && job.requirements.length > 0 && (
        <RequiredSkills requirements={job.requirements} />
      )}
    </View>
  );
};

export default JobDetailContent;
