import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SquarePen } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import type {
  JobPosting,
  JobRequirement,
  RequirementImportance,
} from '../../../../../types/job';
import {
  EMPLOYMENT_TYPE_LABELS,
  formatSalary,
  formatDate,
  getCategoryColors,
} from '../constants';
import { COLORS } from '../../../../constants/theme';

const IMPORTANCE_GROUPS: {
  key: RequirementImportance;
  label: string;
}[] = [
  { key: 'REQUIRED', label: 'Required' },
  { key: 'PREFERRED', label: 'Preferred' },
  { key: 'OPTIONAL', label: 'Nice to Have' },
];

function Divider() {
  return <View className="my-5 h-px bg-app-border-light" />;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-2xl font-semibold text-app-slate-1">{title}</Text>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="text-base text-app-text-3">{label}</Text>
      <Text className="text-base font-semibold text-app-slate-1">{value}</Text>
    </View>
  );
}

function Pill({
  label,
  backgroundColor,
  color,
}: {
  label: string;
  backgroundColor: string;
  color: string;
}) {
  return (
    <View className="rounded-full px-3 py-1.5" style={{ backgroundColor }}>
      <Text className="text-sm font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function SkillPill({ skill }: { skill: JobRequirement }) {
  const experienceText =
    skill.minYearsExperience && skill.minYearsExperience > 0
      ? `${skill.minYearsExperience}+ yrs`
      : 'Any experience';

  return (
    <View className="rounded-[5px] px-3 py-1.5 bg-app-indigo-soft">
      <Text className="text-sm font-semibold text-app-indigo-strong">
        {skill.skillName} ({experienceText})
      </Text>
    </View>
  );
}

const htmlTagStyles: Record<string, Record<string, unknown>> = {
  body: { color: '#0F172A', fontSize: 15, lineHeight: 24 },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    color: '#0F172A',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    color: '#0F172A',
  },
  p: { marginTop: 8, marginBottom: 8 },
  ul: { paddingLeft: 8 },
  ol: { paddingLeft: 8 },
  li: { marginBottom: 4 },
  strong: { fontWeight: '700' },
  em: { fontStyle: 'italic' },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#CBD5E1',
    paddingLeft: 12,
    fontStyle: 'italic',
    color: '#475569',
  },
  code: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  pre: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
};

export function LoadingSkeleton() {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <ActivityIndicator size="large" color={COLORS.primary2} />
      <Text className="mt-4 text-base text-app-text-gray">
        Loading job details…
      </Text>
    </View>
  );
}

interface JobDetailsTabProps {
  job: JobPosting | undefined;
  isLoading: boolean;
  isError: boolean;
  jobId: string | undefined;
}

export default function JobDetailsTab({
  job,
  isLoading,
  isError,
  jobId,
}: JobDetailsTabProps) {
  const router = useRouter();
  const { width: contentWidth } = useWindowDimensions();
  const htmlContentWidth = contentWidth - 64;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !job) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-base text-app-red-1">
          Failed to load job details. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 28,
      }}
    >
      <View className="rounded-2xl border border-app-border-2 bg-white p-4">
        <View className="mb-6 flex-row items-start justify-between">
          {job.company?.logoUrl ? (
            <Image
              source={{ uri: job.company.logoUrl }}
              className="h-[52px] w-[52px] rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="h-[52px] w-[52px] rounded-2xl bg-app-gray-1" />
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            className="p-2"
            onPress={() => router.push(`/pages/employer/edit-job/${jobId}`)}
          >
            <SquarePen size={28} color="#4F46E5" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <Text className="text-4xl font-semibold leading-tight text-app-dark-text">
          {job.title}
        </Text>
      </View>

      <View className="mt-6">
        <SectionTitle title="Description" />
        <View className="mt-4">
          <RenderHtml
            contentWidth={htmlContentWidth}
            source={{
              html: job.description || '<p>No description provided.</p>',
            }}
            tagsStyles={htmlTagStyles}
          />
        </View>
      </View>

      <Divider />

      <View>
        <SectionTitle title="About this role" />
        <View className="mt-4">
          <DetailRow label="Job Posted On" value={formatDate(job.createdAt)} />
          <DetailRow
            label="Job Type"
            value={EMPLOYMENT_TYPE_LABELS[job.type] ?? job.type}
          />
          <DetailRow
            label="Location"
            value={job.remote ? 'Remote' : job.location ?? '—'}
          />
          <DetailRow
            label="Salary"
            value={formatSalary(job.currency, job.salaryMin, job.salaryMax)}
          />
        </View>
      </View>

      <Divider />

      <View>
        <SectionTitle title="Category" />
        <View className="mt-4 flex-row flex-wrap gap-2">
          {job.category && (
            <Pill
              label={job.category.name}
              backgroundColor={getCategoryColors(job.category.name).bg}
              color={getCategoryColors(job.category.name).text}
            />
          )}
        </View>
      </View>

      <Divider />

      {job.requirements && job.requirements.length > 0 && (
        <View>
          <SectionTitle title="Skills" />
          <View className="mt-4" style={{ gap: 16 }}>
            {IMPORTANCE_GROUPS.filter(({ key }) =>
              job.requirements.some((r) => r.importance === key)
            ).map(({ key, label }) => (
              <View key={key}>
                <Text className="mb-1.5 text-xs font-medium text-app-text-3">
                  {label}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {job.requirements
                    .filter((r) => r.importance === key)
                    .map((skill) => (
                      <SkillPill key={skill.skillId} skill={skill} />
                    ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
