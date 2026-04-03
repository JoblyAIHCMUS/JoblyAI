'use client';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import JobListSection from '@/components/find-jobs/JobListSection';
import { useEffect, useRef, useState } from 'react';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import type {
  EmploymentType,
  FilterGroupData,
  JobPosting,
  SortOption,
} from '@/types/job';
import { SALARY_MAX_CAP, PAGE_SIZE, FILTER_GROUPS } from './constants';

function getEmploymentTypeFromLabel(
  label?: string
): EmploymentType | undefined {
  switch (label) {
    case 'Full-time':
      return 'FULL_TIME';
    case 'Part-Time':
      return 'PART_TIME';
    case 'Internship':
      return 'INTERNSHIP';
    case 'Contract':
      return 'CONTRACT';
    case 'Freelance':
      return 'FREELANCE';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<SortOption>('Most relevant');
  const salaryFilterRef = useRef<{ reset: () => void } | null>(null);

  const [filterGroups] = useState<FilterGroupData[]>(FILTER_GROUPS);
  const [checkedMap, setCheckedMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    FILTER_GROUPS.forEach((group) => {
      map[group.title] = group.checked || [];
    });
    return map;
  });

  const handleToggle = (groupTitle: string, itemLabel: string) => {
    setCheckedMap((prev) => {
      const current = prev[groupTitle] ?? [];
      const next = current.includes(itemLabel)
        ? current.filter((label) => label !== itemLabel)
        : [...current, itemLabel];
      return {
        ...prev,
        [groupTitle]: next,
      };
    });
  };

  const [debouncedCheckedMap, setDebouncedCheckedMap] = useState(checkedMap);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCheckedMap(checkedMap), 300);
    return () => clearTimeout(timer);
  }, [checkedMap]);

  const { fetchJobs } = useListJobs();
  const fetchJobsRef = useRef(fetchJobs);

  useEffect(() => {
    fetchJobsRef.current = fetchJobs;
  }, [fetchJobs]);

  const handleSelectSort = (option: SortOption) => {
    setCurrentPage(1);
    setSelectedSort(option);
  };

  const handleSalaryChange = (min: number, max: number) => {
    setSalaryMinFilter(min);
    setSalaryMaxFilter(max);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchTerm('');
    setLocation('');
    setCheckedMap((prev) => {
      const newMap: Record<string, string[]> = {};
      Object.keys(prev).forEach((key) => {
        newMap[key] = [];
      });
      return newMap;
    });
    setSelectedSort('Most relevant');
    setCurrentPage(1);
    salaryFilterRef.current?.reset();
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedCheckedMap,
    location,
    searchTerm,
    salaryMinFilter,
    salaryMaxFilter,
  ]);

  useEffect(() => {
    const employmentSelection = debouncedCheckedMap['Type of Employment'] ?? [];
    const selectedEmploymentTypes = employmentSelection
      .map((label) => getEmploymentTypeFromLabel(label))
      .filter((type): type is EmploymentType => type !== undefined);
    const selectedSkillLabels = [...(debouncedCheckedMap['Categories'] ?? [])];

    const query = {
      page: currentPage,
      pageSize: PAGE_SIZE,
      sort: selectedSort,
      q: searchTerm,
      location,
      type:
        selectedEmploymentTypes.length > 0
          ? selectedEmploymentTypes
          : undefined,
      salaryMin: salaryMinFilter > 0 ? salaryMinFilter : undefined,
      salaryMax: salaryMaxFilter,
      skills: selectedSkillLabels.length > 0 ? selectedSkillLabels : undefined,
    };
    console.log('[FindJobsPage] API query:', query);

    // Clear old jobs before fetching new ones
    setJobs([]);

    void fetchJobsRef.current(query).then((result) => {
      if (result) {
        console.log('[FindJobsPage] fetched jobs:', result.jobs);
        setJobs(result.jobs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    });
  }, [
    currentPage,
    debouncedCheckedMap,
    location,
    searchTerm,
    selectedSort,
    salaryMinFilter,
    salaryMaxFilter,
  ]);

  return (
    <>
      <FindJobsHeroSection
        setSearchTerm={setSearchTerm}
        setLocation={setLocation}
      />
      <JobListSection
        jobs={jobs}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedSort={selectedSort}
        handleSelectSort={handleSelectSort}
        filterGroups={filterGroups}
        checkedMap={checkedMap}
        handleToggle={handleToggle}
        onSalaryChange={handleSalaryChange}
        salaryFilterRef={salaryFilterRef}
        handleReset={handleReset}
      />
    </>
  );
}
