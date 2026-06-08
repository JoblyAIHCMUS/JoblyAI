import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Building2,
  FileText,
  Menu,
  MessageCircleQuestion,
  MapPin,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useListCandidateApplications } from '../../../../hooks/useListCandidateApplications';
import { getFullName, useUser } from '../../../../hooks/useUser';
import { useGetCandidateProfile } from '../../../../hooks/useGetCandidateProfile';
import type { CandidateApplicationRecord } from '../../../../types/application';
import CandidateDashboardSidebar from './components/CandidateDashboardSidebar';

const chartTabs = ['Status', 'Timeline'] as const;

const STATUS_META: Record<
  CandidateApplicationRecord['status'],
  { label: string; color: string; dotColor: string }
> = {
  APPLIED: {
    label: 'Applied',
    color: '#7c8493',
    dotColor: '#7c8493',
  },
  INTERVIEW: {
    label: 'Interview',
    color: '#4640de',
    dotColor: '#4640de',
  },
  OFFER: {
    label: 'Offer',
    color: '#00a36c',
    dotColor: '#00a36c',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#ff6550',
    dotColor: '#ff6550',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    color: '#b0b7c3',
    dotColor: '#b0b7c3',
  },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getCurrentWeekRange(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start,
    end,
    label: `${formatDate(start)} - ${formatDate(end)}`,
  };
}

function parseDateInput(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isWithinDateRange(value: string, start: Date, end: Date): boolean {
  const parsed = parseDateInput(value);

  if (!parsed) {
    return false;
  }

  return parsed >= start && parsed <= end;
}

function formatJobType(value: string): string {
  return value
    .split('_')
    .map((segment) => {
      const lower = segment.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function getInitials(value: string | null | undefined): string {
  if (!value) {
    return 'J';
  }

  const segments = value.trim().split(/\s+/).filter(Boolean);

  if (segments.length === 0) {
    return 'J';
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}

function getStatusLabel(status: CandidateApplicationRecord['status']): string {
  return STATUS_META[status].label;
}

function getStatusColor(status: CandidateApplicationRecord['status']): string {
  return STATUS_META[status].color;
}

function getStatusDotColor(
  status: CandidateApplicationRecord['status']
): string {
  return STATUS_META[status].dotColor;
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  loading?: boolean;
}) {
  return (
    <View className="overflow-hidden rounded-xl border border-[#d6ddeb] bg-white p-4">
      <View className="flex-row items-end justify-between gap-4">
        <View className="flex-1 pr-2">
          <Text className="text-lg font-semibold leading-6 text-[#25324b]">
            {label}
          </Text>
          <View className="mt-6 min-h-14 justify-center">
            {loading ? (
              <ActivityIndicator color="#4640de" />
            ) : (
              <Text className="text-5xl font-medium leading-none text-[#25324b]">
                {value}
              </Text>
            )}
          </View>
        </View>
        <View className="shrink-0 text-[#26a4ff]/30">{icon}</View>
      </View>
    </View>
  );
}

function StatusChartsSection({
  applications,
  loading,
  onViewAllPress,
}: {
  applications: CandidateApplicationRecord[];
  loading: boolean;
  onViewAllPress?: () => void;
}) {
  const [activeView, setActiveView] = useState<'Status' | 'Timeline'>('Status');

  const applicationsByStatus = useMemo(() => {
    return applications.reduce(
      (accumulator, application) => {
        accumulator[application.status] += 1;
        return accumulator;
      },
      {
        APPLIED: 0,
        INTERVIEW: 0,
        OFFER: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
      } satisfies Record<CandidateApplicationRecord['status'], number>
    );
  }, [applications]);

  const timelineBuckets = useMemo(() => {
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + diffToMonday);

    return Array.from({ length: 7 }, (_, index) => {
      const bucketDate = new Date(weekStart);
      bucketDate.setDate(weekStart.getDate() + index);

      const bucketStart = new Date(
        bucketDate.getFullYear(),
        bucketDate.getMonth(),
        bucketDate.getDate()
      );

      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketStart.getDate() + 1);

      const count = applications.filter((application) => {
        const parsed = parseDateInput(application.createdAt);

        if (!parsed) {
          return false;
        }

        return parsed >= bucketStart && parsed < bucketEnd;
      }).length;

      return {
        key: `${bucketDate.getFullYear()}-${bucketDate.getMonth()}-${bucketDate.getDate()}`,
        label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(
          bucketDate
        ),
        count,
      };
    });
  }, [applications]);

  const totalApplications = applications.length;
  const maxTimelineCount = Math.max(
    1,
    ...timelineBuckets.map((bucket) => bucket.count)
  );

  return (
    <View className="w-full overflow-hidden rounded-xl border border-[#d6ddeb] bg-white p-4">
      <View className="flex-row self-start rounded-lg border border-[#d6ddeb] p-1">
        {chartTabs.map((tab) => {
          const active = tab === activeView;

          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => setActiveView(tab)}
              className={`rounded-md px-3 py-1.5 ${
                active ? 'bg-[#eef0ff]' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  active ? 'text-[#4640de]' : 'text-[#7c8493]'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-8 items-center">
        {activeView === 'Status' ? (
          <>
            <Text className="self-start text-lg font-semibold leading-6 text-[#25324b]">
              Jobs Applied Status
            </Text>

            {loading ? (
              <View className="mt-8 h-32 w-32 items-center justify-center rounded-full border-8 border-[#e8ecff] bg-white shadow-lg">
                <ActivityIndicator color="#4640de" />
              </View>
            ) : totalApplications > 0 ? (
              <View className="mt-6 w-full gap-3">
                {Object.entries(applicationsByStatus)
                  .filter(([, count]) => count > 0)
                  .map(([status, count]) => {
                    const typedStatus =
                      status as CandidateApplicationRecord['status'];
                    const percent = Math.round(
                      (count / totalApplications) * 100
                    );

                    return (
                      <View
                        key={status}
                        className="flex-row items-center justify-between rounded-xl bg-[#f8fafc] px-3 py-3"
                      >
                        <View className="flex-row items-center gap-3">
                          <View
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: getStatusDotColor(typedStatus),
                            }}
                          />
                          <Text className="text-sm font-semibold text-[#25324b]">
                            {getStatusLabel(typedStatus)}
                          </Text>
                        </View>
                        <Text className="text-sm font-semibold text-[#25324b]">
                          {percent}% ({count})
                        </Text>
                      </View>
                    );
                  })}
              </View>
            ) : (
              <View className="mt-8 h-32 w-32 items-center justify-center rounded-full border-8 border-[#e8ecff] bg-white shadow-lg">
                <View className="items-center px-4">
                  <Text className="text-lg font-semibold text-[#25324b]">
                    0
                  </Text>
                  <Text className="text-center text-xs text-[#7c8493]">
                    Applications
                  </Text>
                </View>
              </View>
            )}

            {!loading && totalApplications === 0 && (
              <Text className="mt-10 text-sm text-[#7c8493]">
                No applications in current range.
              </Text>
            )}
          </>
        ) : (
          <>
            <Text className="self-start text-lg font-semibold leading-6 text-[#25324b]">
              CV Submitted Timeline
            </Text>

            {loading ? (
              <View className="mt-8 h-40 w-full items-center justify-center rounded-2xl bg-[#f8fafc]">
                <ActivityIndicator color="#4640de" />
              </View>
            ) : totalApplications > 0 ? (
              <View className="mt-6 h-40 w-full flex-row items-end justify-between gap-2 rounded-2xl bg-[#f8fafc] px-3 py-3">
                {timelineBuckets.map((bucket) => {
                  const height = Math.max(
                    20,
                    Math.round((bucket.count / maxTimelineCount) * 100)
                  );

                  return (
                    <View
                      key={bucket.key}
                      className="flex-1 items-center gap-2"
                    >
                      <Text className="text-xs font-semibold text-[#25324b]">
                        {bucket.count}
                      </Text>
                      <View className="h-24 w-full items-end justify-end rounded-full bg-[#e8ecff] px-1 pb-1">
                        <View
                          className="w-full rounded-full bg-[#4640de]"
                          style={{ height: `${height}%` }}
                        />
                      </View>
                      <Text className="text-xs text-[#7c8493]">
                        {bucket.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="mt-8 h-40 w-full items-center justify-center rounded-2xl bg-[#f8fafc]">
                <Text className="text-sm text-[#7c8493]">
                  No timeline data in the selected range.
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        className="mt-8 flex-row items-center self-start gap-2"
        onPress={onViewAllPress}
      >
        <Text className="text-sm font-semibold text-[#4640de]">
          View All Applications
        </Text>
        <ChevronRight size={16} color="#4640de" />
      </TouchableOpacity>
    </View>
  );
}

function RecentApplicationsSection({
  applications,
  loading,
  error,
}: {
  applications: CandidateApplicationRecord[];
  loading: boolean;
  error: unknown;
}) {
  return (
    <View className="rounded-xl border border-[#d6ddeb] bg-white p-4">
      <Text className="pb-4 text-lg font-semibold leading-6 text-[#25324b]">
        Recent Applications History
      </Text>
      <View className="h-px w-full bg-[#d6ddeb]" />

      {error ? (
        <View className="mt-6 min-h-28 rounded-lg bg-[#fff1f0] px-4 py-8">
          <Text className="text-center text-sm text-[#d93025]">
            Unable to load applications. Pull to refresh.
          </Text>
        </View>
      ) : loading ? (
        <View className="mt-6 min-h-28 items-center justify-center rounded-lg bg-[#f8fafc] px-4 py-8">
          <ActivityIndicator color="#4640de" />
        </View>
      ) : applications.length > 0 ? (
        <View className="mt-4 gap-3">
          {applications.map((application) => {
            const companyName =
              application.job.companyName ?? 'Unknown company';
            const location =
              application.job.location ??
              (application.job.remote ? 'Remote' : 'Location unavailable');
            const companyInitials = getInitials(companyName);
            const createdAt = parseDateInput(application.createdAt);
            const statusColor = getStatusColor(application.status);

            return (
              <View
                key={application.id}
                className="rounded-xl border border-[#e8ecff] bg-[#f8fafc] px-3 py-3"
              >
                <View className="flex-row items-start gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#eef0ff]">
                    {application.job.companyLogoUrl ? (
                      <Image
                        source={{ uri: application.job.companyLogoUrl }}
                        className="h-12 w-12 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-xs font-bold text-[#4640de]">
                        {companyInitials}
                      </Text>
                    )}
                  </View>

                  <View className="flex-1 gap-1">
                    <Text
                      className="text-base font-semibold leading-5 text-[#25324b]"
                      numberOfLines={2}
                    >
                      {application.job.title}
                    </Text>

                    <View className="flex-row flex-wrap items-center gap-3">
                      <View className="flex-row items-center gap-1.5">
                        <Building2 size={13} color="#7c8493" />
                        <Text className="text-xs text-[#7c8493]">
                          {companyName}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-1.5">
                        <MapPin size={13} color="#7c8493" />
                        <Text className="text-xs text-[#7c8493]">
                          {location}
                        </Text>
                      </View>

                      {createdAt && (
                        <View className="flex-row items-center gap-1.5">
                          <Clock3 size={13} color="#7c8493" />
                          <Text className="text-xs text-[#7c8493]">
                            {formatShortDate(createdAt)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: `${statusColor}14` }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: statusColor }}
                    >
                      {getStatusLabel(application.status)}
                    </Text>
                  </View>
                </View>

                <Text className="mt-3 text-xs text-[#7c8493]">
                  {formatJobType(application.job.type)} job
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="mt-6 min-h-28 rounded-lg bg-[#f8fafc] px-4 py-8">
          <Text className="text-center text-sm text-[#7c8493]">
            No applications found for this filter.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function CandidateDashboard() {
  const { data: user, isPending: isSessionPending } = useUser();
  const { data: profile } = useGetCandidateProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentWeekRange = useMemo(() => getCurrentWeekRange(), []);
  const greeting = getGreeting();
  const firstName = profile?.firstName || profile?.name?.split(' ')[0] || getFullName(user).split(' ')[0] || '';
  const dateRangeLabel = currentWeekRange.label;
  const {
    data: applicationsResult,
    fetchApplications,
    loading: applicationsLoading,
    error: applicationsError,
  } = useListCandidateApplications();

  const allApplications = useMemo(
    () => applicationsResult?.applications ?? [],
    [applicationsResult]
  );
  const currentRangeApplications = useMemo(
    () =>
      allApplications.filter((application) =>
        isWithinDateRange(
          application.createdAt,
          currentWeekRange.start,
          currentWeekRange.end
        )
      ),
    [allApplications, currentWeekRange.end, currentWeekRange.start]
  );

  const recentApplications = useMemo(
    () =>
      [...currentRangeApplications]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
        )
        .slice(0, 6),
    [currentRangeApplications]
  );

  const totalApplied = currentRangeApplications.length;
  const interviewedCount = useMemo(
    () =>
      currentRangeApplications.filter((application) =>
        ['INTERVIEW', 'OFFER', 'REJECTED'].includes(application.status)
      ).length,
    [currentRangeApplications]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await fetchApplications({ pageSize: 100 });
    } finally {
      setRefreshing(false);
    }
  }, [fetchApplications]);

  useEffect(() => {
    if (
      isSessionPending ||
      !user ||
      applicationsLoading ||
      applicationsResult
    ) {
      return;
    }

    void fetchApplications({ pageSize: 100 });
  }, [
    applicationsLoading,
    applicationsResult,
    fetchApplications,
    isSessionPending,
    user,
  ]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#f9fbff]"
      edges={['top', 'left', 'right']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View className="border-b border-[#d6ddeb] bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            className="p-2"
            onPress={() => setIsSidebarOpen(true)}
          >
            <Menu size={22} color="#25324b" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-[#25324b]">Dashboard</Text>

          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#eef0ff]">
              <Text className="text-sm font-bold text-[#4640de]">
                {(firstName || 'U').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="relative p-2">
              <Bell size={22} color="#25324b" />
              <View className="absolute right-1 top-1 h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b5a] px-1">
                <Text className="text-xs font-bold leading-3 text-white">
                  9
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-4 px-4 py-4">
          <View>
            <Text className="text-3xl font-bold leading-8 text-[#25324b]">
              {greeting}, {firstName}
            </Text>
            <Text className="mt-2 text-base leading-6 text-[#7c8493]">
              Here is what's happening with your job search applications from{' '}
              {dateRangeLabel}.
            </Text>
            {applicationsError ? (
              <Text className="mt-3 text-sm text-[#d93025]">
                Unable to sync applications right now.
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-between rounded-lg border border-[#d6ddeb] bg-white px-3 py-3"
          >
            <Text className="text-sm font-medium text-[#25324b]">
              {dateRangeLabel}
            </Text>
            <CalendarDays size={18} color="#4640de" />
          </TouchableOpacity>

          <StatCard
            label="Total Jobs Applied"
            value={totalApplied}
            loading={applicationsLoading && totalApplied === 0}
            icon={<FileText size={48} color="#26a4ff" strokeWidth={1.4} />}
          />

          <StatCard
            label="Interviewed"
            value={interviewedCount}
            loading={applicationsLoading && interviewedCount === 0}
            icon={
              <MessageCircleQuestion
                size={48}
                color="#26a4ff"
                strokeWidth={1.4}
              />
            }
          />

          <StatusChartsSection
            applications={currentRangeApplications}
            loading={applicationsLoading && allApplications.length === 0}
            onViewAllPress={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          />

          <RecentApplicationsSection
            applications={recentApplications}
            loading={applicationsLoading && allApplications.length === 0}
            error={applicationsError}
          />
        </View>
      </ScrollView>

      <CandidateDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath="/pages/candidate/dashboard"
      />
    </SafeAreaView>
  );
}