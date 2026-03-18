'use client';

import { ApplicationTable } from '@/components/candidate/applicationTable';
import { ApplicationHistoryRow } from '@/components/candidate/applicationHistoryRow';
import { ApplicationsHeader } from '@/components/candidate/applicationsHeader';
import { ApplicationStatusTabs } from '@/features/candidate/applications/components/ApplicationStatusTabs';
import { ApplicationsFeatureNotice } from '@/features/candidate/applications/components/ApplicationsFeatureNotice';
import { ApplicationsFilterDialog } from '@/features/candidate/applications/components/ApplicationsFilterDialog';
import { ApplicationsSearchToolbar } from '@/features/candidate/applications/components/ApplicationsSearchToolbar';
import { useApplicationsPageState } from '@/features/candidate/applications/hooks/useApplicationsPageState';
import { useCandidateDashboard } from '@/features/candidate/hooks/useCandidateDashboard';
import { useUser } from '@/hooks/useUser';

export default function CandidateApplicationsPage() {
  const { data: user } = useUser();
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

  const firstName = user?.name?.split(' ')[0] ?? 'Jake';
  const activityStatusText =
    dateRangeLabel === 'Select date range'
      ? 'from all time'
      : `from ${dateRangeLabel}`;
  const activityRangeText = `Here’s the status of your applications ${activityStatusText}.`;

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
            onOpenFilter={() => setIsFilterDialogOpen(true)}
          />

          <ApplicationsFilterDialog
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
              />
            )}
          />
        </section>
      </div>
    </div>
  );
}
