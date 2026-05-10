'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { ChevronRight, FileText, MessageCircleQuestion } from 'lucide-react';

import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from '@/contexts/page-title-context';
import { useCandidateProfileContext } from '@/api-hook/candidate';
import { ApplicationsHeader } from '@/components/candidate/applicationsHeader';
import { ApplicationTable } from '@/components/candidate/applicationTable';
import { ApplicationHistoryRow } from '@/components/candidate/applicationHistoryRow';
import { ApplicationFilter, ApplicationItem } from '@/types/candidate';
import { useCandidateDashboard } from '@/features/candidate/hooks/useCandidateDashboard';
import { useInitializeConversation } from '@/api-hook/messages';
import { StatCard } from './components/StatCard';
import { StatusChartsSection } from './components/StatusChartsSection';
import { useDashboardInsights } from './hooks/useDashboardInsights';
import { formatDateRangeLabel, getGreeting } from '@/lib/candidateDate';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setTitle } = usePageTitle();
  const { data: candidateProfile } = useCandidateProfileContext();

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  const { data: user } = useUser();
  const { initChat } = useInitializeConversation({
    onError: (error) => {
      console.error('Failed to initialize conversation:', error);
      toast.error('Failed to open conversation. Please try again.');
    },
  });
  const {
    applicationFilter,
    setApplicationFilter,
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
    filteredApplications,
    statusMeta,
    filterMeta,
  } = useCandidateDashboard();

  const recentApplications = useMemo(
    () => filteredApplications.slice(0, 10),
    [filteredApplications]
  );

  const firstName =
    candidateProfile?.name?.split(' ')[0] ??
    user?.name?.split(' ')[0] ??
    'Jake';
  const greeting = getGreeting();
  const dateRangeLabel = formatDateRangeLabel(
    selectedStartDate,
    selectedEndDate
  );
  const activityRangeText =
    dateRangeLabel === 'Select date range'
      ? 'from all time'
      : `from ${dateRangeLabel}`;
  const activityRangeTextFormatted = `Here is what's happening with your job search applications ${activityRangeText}.`;

  const { barChartItems, pieChartItems, pieChartBackground, interviewedCount } =
    useDashboardInsights({
      filteredApplications,
      selectedStartDate,
      selectedEndDate,
      statusMeta,
    });

  const handleMessageRecruiter = async (item: ApplicationItem) => {
    if (!user?.id) {
      toast.error('User not found. Please log in again.');
      return;
    }

    try {
      await initChat(user.id, item.recruiterId);
      router.push(`/candidate/messages?recruiterId=${item.recruiterId}`);
    } catch (error) {
      console.error('Error initiating conversation:', error);
      // Error toast is already shown via the hook's onError callback
    }
  };

  return (
    <div className="min-h-full bg-white">
      <div className="flex flex-col gap-6 px-4 py-5 sm:gap-8 sm:py-6 md:px-8 md:py-6">
        <ApplicationsHeader
          greeting={greeting}
          firstName={firstName}
          dateRangeLabel={dateRangeLabel}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          setSelectedStartDate={setSelectedStartDate}
          setSelectedEndDate={setSelectedEndDate}
          activityRangeText={activityRangeTextFormatted}
        />

        <section className="grid gap-6 xl:grid-cols-[258px_1fr]">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard
              label="Total Jobs Applied"
              value={pieChartItems.total}
              icon={
                <FileText
                  className="h-18 w-18 sm:h-28 sm:w-28"
                  strokeWidth={1.4}
                />
              }
            />
            <StatCard
              label="Interviewed"
              value={interviewedCount}
              icon={
                <MessageCircleQuestion
                  className="h-18 w-18 sm:h-28 sm:w-28"
                  strokeWidth={1.4}
                />
              }
            />
          </div>

          <StatusChartsSection
            barChartItems={barChartItems}
            pieChartItems={pieChartItems}
            pieChartBackground={pieChartBackground}
          />
        </section>

        <section
          id="applications"
          className="rounded-none border border-[#d6ddeb] bg-white p-4 sm:p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-[#d6ddeb] pb-5 lg:flex-row lg:items-center lg:justify-between lg:border-b-0 lg:pb-0">
            <p className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
              Recent Applications History
            </p>

            <div className="hidden w-full rounded-lg border border-[#d6ddeb] p-1 lg:inline-flex lg:w-auto">
              {(Object.keys(filterMeta) as ApplicationFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setApplicationFilter(filter)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors lg:flex-none ${
                      applicationFilter === filter
                        ? 'bg-[#eef0ff] text-[#4640de]'
                        : 'text-[#7c8493] hover:text-[#25324b]'
                    }`}
                  >
                    {filterMeta[filter].label}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="mt-7 hidden h-px w-full bg-[#d6ddeb] lg:block" />

          <ApplicationTable
            filteredApplications={recentApplications}
            paginatedApplications={recentApplications}
            statusMeta={statusMeta}
            renderRow={(item, index, tinted, statusMeta) => (
              <ApplicationHistoryRow
                key={item.id}
                item={item}
                index={index}
                tinted={tinted}
                statusMeta={statusMeta}
                onMessageRecruiter={handleMessageRecruiter}
              />
            )}
          />

          {filteredApplications.length > 7 && (
            <Link
              href="/candidate/applications"
              className="mt-8 inline-flex items-center gap-3 font-[family-name:var(--family-primary)] text-sm font-semibold leading-5 text-[#4640de] sm:text-base sm:leading-[22px]"
            >
              View all applications history
              <ChevronRight className="h-5 w-5" />
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
