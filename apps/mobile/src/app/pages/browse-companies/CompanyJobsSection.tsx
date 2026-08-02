import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import {
  BriefcaseBusiness,
  DollarSign,
  Laptop,
  MapPin,
} from 'lucide-react-native';

import type { EmploymentType, JobPosting } from '@/types/job';
import { COLORS } from '@/app/constants/theme';

export interface CompanyJobsSectionProps {
  companyName: string;
  jobs: JobPosting[];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onApplyPress: () => void;
}

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

function stripHtml(value: string | null): string {
  return (
    value
      ?.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() ?? ''
  );
}

function formatSalary(job: JobPosting): string {
  if (!job.salaryMin && !job.salaryMax) {
    return 'Salary not specified';
  }

  const currency = job.currency || 'USD';
  const formatter = new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  });

  if (job.salaryMin && job.salaryMax) {
    return `${formatter.format(job.salaryMin)} - ${formatter.format(
      job.salaryMax
    )}`;
  }

  if (job.salaryMin) {
    return `From ${formatter.format(job.salaryMin)}`;
  }

  return `Up to ${formatter.format(job.salaryMax ?? 0)}`;
}

export function CompanyJobsSection({
  companyName,
  jobs,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onApplyPress,
}: CompanyJobsSectionProps) {
  const visiblePageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1
  );
  const showPagination =
    totalPages > 1 && !error && !(isLoading && jobs.length === 0);

  return (
    <View className="mt-6 pb-8">
      <View className="mb-3 flex-row items-end justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-app-text-4">
            Jobs at {companyName}
          </Text>
          <Text className="mt-1 text-sm text-app-text-2">
            Roles this company is hiring for right now.
          </Text>
        </View>
      </View>

      {isLoading && jobs.length === 0 ? (
        <View className="items-center rounded-lg border border-app-border-1 bg-app-white-1 px-4 py-10">
          <ActivityIndicator color={COLORS.primary2} />
          <Text className="mt-3 text-sm text-app-text-2">
            Loading open jobs...
          </Text>
        </View>
      ) : error ? (
        <View className="rounded-lg bg-app-tag-red-bg px-4 py-8">
          <Text className="text-center text-sm text-app-tag-red-text">
            Unable to load jobs for this company.
          </Text>
        </View>
      ) : jobs.length === 0 ? (
        <View className="rounded-lg border border-app-border-1 bg-app-white-1 px-4 py-8">
          <Text className="text-center text-base font-semibold text-app-text-4">
            No open jobs right now
          </Text>
          <Text className="mt-2 text-center text-sm text-app-text-2">
            Check back later or browse other companies.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {jobs.map((job) => {
            const location =
              job.location || (job.remote ? 'Remote' : 'Location unavailable');
            const preview = stripHtml(job.description);

            return (
              <View
                key={job.id}
                className="rounded-lg border border-app-border-1 bg-app-white-1 p-4"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold leading-6 text-app-text-4"
                      numberOfLines={2}
                    >
                      {job.title}
                    </Text>
                    <Text
                      className="mt-1 text-sm text-app-text-2"
                      numberOfLines={1}
                    >
                      {job.category.name}
                    </Text>
                  </View>
                  <View className="rounded-full bg-app-emerald-1 px-3 py-1">
                    <Text
                      className="text-xs font-bold"
                      style={{ color: COLORS.successText }}
                    >
                      Open
                    </Text>
                  </View>
                </View>

                <View className="mt-4 gap-2">
                  <View className="flex-row items-center gap-2">
                    <MapPin size={16} color={COLORS.textLight} />
                    <Text className="flex-1 text-sm text-app-text-2">
                      {location}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <BriefcaseBusiness size={16} color={COLORS.textLight} />
                    <Text className="text-sm text-app-text-2">
                      {EMPLOYMENT_TYPE_LABELS[job.type] ?? job.type}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <DollarSign size={16} color={COLORS.textLight} />
                    <Text className="flex-1 text-sm text-app-text-2">
                      {formatSalary(job)}
                    </Text>
                  </View>
                  {job.remote ? (
                    <View className="flex-row items-center gap-2">
                      <Laptop size={16} color={COLORS.textLight} />
                      <Text className="text-sm text-app-text-2">
                        Remote friendly
                      </Text>
                    </View>
                  ) : null}
                </View>

                {preview ? (
                  <Text
                    className="mt-4 text-sm leading-5 text-app-text-5"
                    numberOfLines={3}
                  >
                    {preview}
                  </Text>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.85}
                  className="mt-4 h-11 items-center justify-center rounded-lg bg-app-primary-1"
                  onPress={onApplyPress}
                >
                  <Text className="text-sm font-bold text-white">Apply</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {showPagination ? (
        <View className="mt-4 rounded-lg border border-app-border-1 bg-app-white-1 px-3 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`rounded px-3 py-2 ${
                currentPage === 1 ? 'bg-app-bg-disabled' : 'bg-app-primary-2'
              }`}
            >
              <Text
                className={`font-semibold ${
                  currentPage === 1 ? 'text-app-text-placeholder' : 'text-white'
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              {visiblePageNumbers.map((pageNumber) => (
                <TouchableOpacity
                  key={pageNumber}
                  activeOpacity={0.85}
                  onPress={() => onPageChange(pageNumber)}
                  className={`rounded px-3 py-2 ${
                    currentPage === pageNumber
                      ? 'bg-app-primary-2'
                      : 'bg-app-bg-disabled'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      currentPage === pageNumber
                        ? 'text-white'
                        : 'text-app-gray-2'
                    }`}
                  >
                    {pageNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`rounded px-3 py-2 ${
                currentPage === totalPages
                  ? 'bg-app-bg-disabled'
                  : 'bg-app-primary-2'
              }`}
            >
              <Text
                className={`font-semibold ${
                  currentPage === totalPages
                    ? 'text-app-text-placeholder'
                    : 'text-white'
                }`}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}
