'use client';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import JobListSection from '@/components/find-jobs/JobListSection';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import { useCategories } from '@/api-hook/jobs/useCategories';
import { useSkillsFilter } from '@/api-hook/jobs/useSkillsFilter';
import { usePageTitle } from '@/contexts/page-title-context';
import type { EmploymentType, JobPosting, SortOption } from '@/types/job';
import {
  SALARY_MAX_CAP,
  PAGE_SIZE,
  FILTER_GROUPS as INITIAL_FILTER_GROUPS,
} from './constants';

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
  const { setTitle } = usePageTitle();
  const { categories } = useCategories();

  useEffect(() => {
    setTitle('Find Jobs');
  }, [setTitle]);

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMinFilter, setSalaryMinFilter] = useState(0);
  const [salaryMaxFilter, setSalaryMaxFilter] = useState(SALARY_MAX_CAP);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<SortOption>('MOST_RELEVANT');
  const salaryFilterRef = useRef<{ reset: () => void } | null>(null);
  const lastFetchedQuerySignatureRef = useRef('');

  // Fetch skills based on search term - independent of pagination
  const { skills: filteredSkills, fetchSkills } = useSkillsFilter();

  // Fetch skills when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      fetchSkills(searchTerm);
    } else {
      // Clear skills if search term is empty
      fetchSkills('');
    }
  }, [searchTerm]); // Removed fetchSkills from dependency - causes infinite loop

  // Derive filterGroups from categories and fetched skills using useMemo
  const filterGroups = useMemo(() => {
    return INITIAL_FILTER_GROUPS.map((group) => {
      if (group.title === 'Categories') {
        return {
          ...group,
          items: categories.map((cat) => ({ label: cat.name, value: cat.id })),
        };
      }
      if (group.title === 'Skills') {
        return {
          ...group,
          items: filteredSkills.map((skill) => ({ label: skill.name })),
        };
      }
      return group;
    });
  }, [categories, filteredSkills]);

  // Initialize checkedMap based on filterGroups
  const [checkedMap, setCheckedMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    filterGroups.forEach((group) => {
      map[group.title] = [];
    });
    return map;
  });

  // Sync checkedMap when filterGroups changes (ensure all groups are present)
  useEffect(() => {
    setCheckedMap((prev) => {
      const updated: Record<string, string[]> = {};
      filterGroups.forEach((group) => {
        // Keep existing checked items or initialize empty
        updated[group.title] = prev[group.title] ?? [];

        // For Categories, filter out IDs that no longer exist
        if (group.title === 'Categories') {
          const validIds = categories.map((cat) => cat.id);
          updated[group.title] = (prev[group.title] ?? []).filter(
            (id: string | number) => validIds.includes(Number(id))
          );
        }

        // For Skills, filter out skills that no longer exist
        if (group.title === 'Skills') {
          const validSkillNames = filteredSkills.map((skill) => skill.name);
          updated[group.title] = (prev[group.title] ?? []).filter((skillName) =>
            validSkillNames.includes(skillName)
          );
        }
      });
      return updated;
    });
  }, [filterGroups, categories, filteredSkills]);

  const handleToggle = (
    groupTitle: string,
    itemLabel: string,
    itemValue?: string | number
  ) => {
    setCheckedMap((prev) => {
      const current = prev[groupTitle] ?? [];
      // For categories, use itemValue (ID); for others, use itemLabel
      const identifier =
        groupTitle === 'Categories' ? String(itemValue) : itemLabel;
      const next = current.includes(identifier)
        ? current.filter((label) => label !== identifier)
        : [...current, identifier];
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

  const handleSelectSort = (option: SortOption) => {
    setCurrentPage(1);
    setSelectedSort(option);
  };

  const handleSalaryChange = (min: number, max: number) => {
    setSalaryMinFilter(min);
    setSalaryMaxFilter(max);
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
    setSelectedSort('MOST_RELEVANT');
    setSalaryMinFilter(0);
    setSalaryMaxFilter(SALARY_MAX_CAP);
    setCurrentPage(1);
    salaryFilterRef.current?.reset();
  };

  useEffect(() => {
    const querySignature = JSON.stringify({
      searchTerm,
      location,
      salaryMinFilter,
      salaryMaxFilter,
      debouncedCheckedMap,
      selectedSort,
    });

    if (currentPage > 1 && lastFetchedQuerySignatureRef.current !== querySignature) {
      setCurrentPage(1);
      return;
    }

    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const employmentSelection =
          debouncedCheckedMap['Type of Employment'] ?? [];
        const selectedEmploymentTypes = employmentSelection
          .map((label) => getEmploymentTypeFromLabel(label))
          .filter((type): type is EmploymentType => type !== undefined);
        const selectedSkills = debouncedCheckedMap['Skills'] ?? [];
        const selectedCategoryIds =
          debouncedCheckedMap['Categories']
            ?.map((id) => Number(id))
            .filter((id: number) => !!id) ?? [];

        const result = await fetchJobs({
          page: currentPage,
          pageSize: PAGE_SIZE,
          sort: selectedSort,
          q: searchTerm,
          location,
          type:
            selectedEmploymentTypes.length > 0
              ? selectedEmploymentTypes
              : undefined,
          categories:
            selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
          salaryMin: salaryMinFilter > 0 ? salaryMinFilter : undefined,
          salaryMax: salaryMaxFilter,
          skills: selectedSkills.length > 0 ? selectedSkills : undefined,
        }, {
          signal: abortController.signal,
        });

        if (result) {
          const nextTotalPages = Math.max(result.totalPages || 1, 1);

          setTotal(result.total);
          setTotalPages(nextTotalPages);

          if (currentPage > nextTotalPages) {
            setCurrentPage(nextTotalPages);
            return;
          }

          setJobs(result.jobs);
          lastFetchedQuerySignatureRef.current = querySignature;
        }
      } catch (error) {
        const isAbortError =
          (error instanceof DOMException && error.name === 'AbortError') ||
          (typeof error === 'object' &&
            error !== null &&
            'name' in error &&
            (error as { name?: string }).name === 'CanceledError');

        if (!isAbortError) {
          console.error('[FindJobsPage] failed to fetch jobs:', error);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [
    currentPage,
    selectedSort,
    searchTerm,
    location,
    salaryMinFilter,
    salaryMaxFilter,
    debouncedCheckedMap,
    fetchJobs,
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
