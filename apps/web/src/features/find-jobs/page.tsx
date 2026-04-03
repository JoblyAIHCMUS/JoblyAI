'use client';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import JobListSection from '@/components/find-jobs/JobListSection';
import { useEffect, useRef, useState } from 'react';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import { useFilters } from '@/hooks/useFilters';
import { SORT_OPTIONS, SortOption } from '@/mocks/sortOptions';
import { EmploymentType, JobPosting, ViewMode } from '@/types/job';

const SALARY_MAX_CAP = 200_000;

type SearchParams = {
  term?: string;
  location?: string;
  page?: number;
  sort?: SortOption;
};

function getEmploymentTypeFromLabel(label?: string): EmploymentType | undefined {
  switch (label) {
    case 'Full-time':
      return 'FULL_TIME';
    case 'Part-Time':
      return 'PART_TIME';
    case 'Internship':
      return 'INTERNSHIP';
    case 'Contract':
      return 'CONTRACT';
    default:
      return undefined;
  }
}


export default function FindJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMinFilter, setSalaryMinFilter] = useState(0);
  const [salaryMaxFilter, setSalaryMaxFilter] = useState(SALARY_MAX_CAP);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const {
    filterGroups,
    checkedMap,
    expandedMap,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
    handleToggle,
    handleToggleExpand,
    handleApplyMobileFilters,
  } = useFilters();

  const { fetchJobs } = useListJobs();
  const fetchJobsRef = useRef(fetchJobs);

  useEffect(() => {
    fetchJobsRef.current = fetchJobs;
  }, [fetchJobs]);

  const handleSearch = (params: SearchParams = {}) => {
    if (params.term !== undefined) {
      setSearchTerm(params.term);
    }
    if (params.location !== undefined) {
      setLocation(params.location);
    }
    if (params.sort !== undefined) {
      setSelectedSort(params.sort);
    }
    if (params.page !== undefined) {
      setCurrentPage(params.page);
    }
    if (
      params.term !== undefined ||
      params.location !== undefined ||
      params.sort !== undefined
    ) {
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    const employmentSelection = checkedMap['Type of Employment'] ?? [];
    const selectedEmploymentLabel = employmentSelection.find(
      (label) => label !== 'Remote'
    );
    const selectedSkillLabels = [
      ...(checkedMap['Categories'] ?? []),
      ...(checkedMap['Job Level'] ?? []),
    ];

    void fetchJobsRef.current({
      page: currentPage,
      pageSize,
      sort: selectedSort,
      q: searchTerm,
      location,
      type: getEmploymentTypeFromLabel(selectedEmploymentLabel),
      remote: employmentSelection.includes('Remote') ? true : undefined,
      salaryMin: salaryMinFilter > 0 ? salaryMinFilter : undefined,
      salaryMax: salaryMaxFilter,
      skills: selectedSkillLabels.length > 0 ? selectedSkillLabels : undefined,
    }).then((result) => {
      if (result) {
        console.log('[FindJobsPage] fetched jobs:', result.jobs);
        setJobs(result.jobs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    });
  }, [
    currentPage,
    checkedMap,
    location,
    pageSize,
    searchTerm,
    selectedSort,
    salaryMinFilter,
    salaryMaxFilter,
  ]);

  return (
    <>
      <FindJobsHeroSection
        handleSearch={handleSearch}
      />
      <JobListSection
        jobs={jobs}
        total={total}
        totalPages={totalPages}
        pageSize={pageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sortOptions={SORT_OPTIONS.slice()}
        isSortOpen={isSortOpen}
        setIsSortOpen={setIsSortOpen}
        selectedSort={selectedSort}
        handleSelectSort={(option) => {
          setSelectedSort(option);
          setIsSortOpen(false);
        }}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleSearch={handleSearch}
        filterGroups={filterGroups}
        checkedMap={checkedMap}
        expandedMap={expandedMap}
        isMobileFiltersOpen={isMobileFiltersOpen}
        setIsMobileFiltersOpen={setIsMobileFiltersOpen}
        handleToggle={handleToggle}
        handleToggleExpand={handleToggleExpand}
        handleApplyMobileFilters={handleApplyMobileFilters}
        salaryMinFilter={salaryMinFilter}
        salaryMaxFilter={salaryMaxFilter}
        setSalaryMinFilter={setSalaryMinFilter}
        setSalaryMaxFilter={setSalaryMaxFilter}
      />
    </>
  );
}
