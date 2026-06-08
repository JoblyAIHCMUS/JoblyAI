'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ApplicationTable } from '@/components/candidate/applicationTable';
import { ApplicationHistoryRow } from '@/components/candidate/applicationHistoryRow';
import { ApplicationsHeader } from '@/components/candidate/applicationsHeader';
import { ApplicationStatusTabs } from '@/features/candidate/applications/components/ApplicationStatusTabs';
import { ApplicationsFeatureNotice } from '@/features/candidate/applications/components/ApplicationsFeatureNotice';
import { ApplicationsFilterDialog } from '@/features/candidate/applications/components/ApplicationsFilterDialog';
import { ApplicationsSearchToolbar } from '@/features/candidate/applications/components/ApplicationsSearchToolbar';
import { useApplicationsPageState } from '@/features/candidate/applications/hooks/useApplicationsPageState';
import { usePageTitle } from '@/contexts/page-title-context';
import { useWithdrawApplication } from '@/api-hook/application';
import { useCandidateDashboard } from '@/features/candidate/hooks/useCandidateDashboard';
import { useCandidateProfileContext } from '@/api-hook/candidate';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { useInitializeConversation } from '@/api-hook/messages';
import { ApplicationItem } from '@/types/candidate';

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('My Applications');
  }, [setTitle]);

  const filterDialogId = 'applications-filter-dialog';
  const { data: candidateProfile } = useCandidateProfileContext();
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
    dateRangeLabel,
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    pageSize,
    tabs,
    visiblePages,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    statusMeta,
    searchQuery,
    setSearchQuery,
    applySearch,
    reloadApplications,
    isSearching,
    searchError,
    advancedFilters,
    applyAdvancedFilters,
    clearAdvancedFilters,
    activeAdvancedFilterCount,
    companyOptions,
    jobTypeOptions,
    locationOptions,
  } = useCandidateDashboard();
  const { withdrawApplication } = useWithdrawApplication();

  const {
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    filterDraft,
    setFilterDraft,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleApplyFilters,
    handleClearFilters,
  } = useApplicationsPageState({
    applicationFilter,
    setApplicationFilter,
    advancedFilters,
    applyAdvancedFilters,
    clearAdvancedFilters,
    applySearch,
  });

  const firstName = candidateProfile?.name?.split(' ')[0] ?? '';
  const activityStatusText =
    dateRangeLabel === 'Select date range'
      ? 'from all time'
      : `from ${dateRangeLabel}`;
  const activityRangeText = `Here’s the status of your applications ${activityStatusText}.`;

  const handleMoreActionSelect = async (
    option: string,
    item: ApplicationItem
  ) => {
    if (option !== 'Withdraw application') {
      return;
    }

    if (
      !window.confirm('Are you sure you want to withdraw this application?')
    ) {
      return;
    }

    const applicationId = Number(item.id);
    if (Number.isNaN(applicationId)) {
      return;
    }

    try {
      await withdrawApplication(applicationId);
      reloadApplications();
      toast.success('Successfully withdrawn application');
    } catch (error) {
      console.error('[CandidateApplicationsPage] Withdraw failed', { error });
      toast.error('Failed to withdraw application. Please try again.');
    }
  };

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
          greeting="Keep it up"
          firstName={firstName}
          dateRangeLabel={dateRangeLabel}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          setSelectedStartDate={setSelectedStartDate}
          setSelectedEndDate={setSelectedEndDate}
          activityRangeText={activityRangeText}
        />

        <ApplicationsFeatureNotice />

        <ApplicationStatusTabs
          tabs={tabs}
          activeFilter={applicationFilter}
          onChangeFilter={setApplicationFilter}
        />

        <section className="rounded-none bg-white">
          <ApplicationsSearchToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            onSearchKeyDown={handleSearchKeyDown}
            isSearching={isSearching}
            activeAdvancedFilterCount={activeAdvancedFilterCount}
            isFilterDialogOpen={isFilterDialogOpen}
            filterDialogId={filterDialogId}
            onOpenFilter={() => setIsFilterDialogOpen(true)}
          />

          <ApplicationsFilterDialog
            dialogContentId={filterDialogId}
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
            filterDraft={filterDraft}
            setFilterDraft={setFilterDraft}
            companyOptions={companyOptions}
            jobTypeOptions={jobTypeOptions}
            locationOptions={locationOptions}
            dateRangeLabel={dateRangeLabel}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />

          {searchError && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-[#ffd9d4] bg-[#fff7f5] px-4 py-3 text-sm text-[#9b2c2c]"
            >
              {searchError}
            </div>
          )}

          <ApplicationTable
            filteredApplications={filteredApplications}
            paginatedApplications={paginatedApplications}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            statusMeta={statusMeta}
            visiblePages={visiblePages}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            goToPage={goToPage}
            renderRow={(item, index, tinted, statusMeta) => (
              <ApplicationHistoryRow
                key={item.id}
                item={item}
                index={index}
                tinted={tinted}
                statusMeta={statusMeta}
                onMoreActionSelect={handleMoreActionSelect}
                onMessageRecruiter={handleMessageRecruiter}
              />
            )}
          />
        </section>
      </div>
    </div>
  );
}
