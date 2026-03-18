'use client';

import { ApplicationTable } from '@/components/candidate/applicationTable';
import { ApplicationHistoryRow } from '@/components/candidate/applicationHistoryRow';
import { ApplicationsHeader } from '@/components/candidate/applicationsHeader';
import { ApplicationStatusTabs } from '@/features/candidate/applications/components/ApplicationStatusTabs';
import { ApplicationsFeatureNotice } from '@/features/candidate/applications/components/ApplicationsFeatureNotice';
import { ApplicationsFilterDialog } from '@/features/candidate/applications/components/ApplicationsFilterDialog';
import { ApplicationsSearchToolbar } from '@/features/candidate/applications/components/ApplicationsSearchToolbar';
import { useApplicationsPageState } from '@/features/candidate/applications/hooks/useApplicationsPageState';
import { useUser } from '@/hooks/useUser';
import { useCandidateDashboard } from '@/features/candidate/hook/useCandidateDashboard';

export default function CandidateApplicationsPage() {
  const { data: user } = useUser();
  const {
    applications,
    applicationFilter,
    setApplicationFilter,
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    pageSize,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    statusMeta,
    searchQuery,
    setSearchQuery,
    applySearch,
    isSearching,
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
    dateRangeLabel,
    activityRangeText,
    tabs,
    visiblePages,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleApplyFilters,
    handleClearFilters,
  } = useApplicationsPageState({
    applications,
    applicationFilter,
    setApplicationFilter,
    selectedStartDate,
    selectedEndDate,
    advancedFilters,
    applyAdvancedFilters,
    clearAdvancedFilters,
    applySearch,
    currentPage,
    totalPages,
  });

  const firstName = user?.name?.split(' ')[0] ?? 'Jake';

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
