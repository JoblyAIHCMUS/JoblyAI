'use client';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import JobListSection from '@/components/find-jobs/JobListSection';
import axios from 'axios';
import {
  useEffect,
  useState,
  useMemo,
  useRef,
  Suspense,
  useCallback,
} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import { useRecommendJobs } from '@/api-hook/jobs/useRecommendJobs';
import { useCategories } from '@/api-hook/jobs/useCategories';
import { useSkillsFilter } from '@/api-hook/jobs/useSkillsFilter';
import { usePageTitle } from '@/contexts/page-title-context';
import { useUser } from '@/hooks/useUser';
import { useListCandidateApplications } from '@/api-hook/application';
import { BriefcaseBusiness } from 'lucide-react';
import type { EmploymentType, JobPosting, SortOption } from '@/types/job';
import {
  SALARY_MAX_CAP,
  PAGE_SIZE,
  FILTER_GROUPS as INITIAL_FILTER_GROUPS,
  SupportedCurrency,
  capFor,
  isSupportedCurrency,
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
  return (
    <Suspense fallback={<div>Loading tasks...</div>}>
      <FindJobsPageContent />
    </Suspense>
  );
}

function FindJobsPageContent() {
  const { setTitle } = usePageTitle();
  const { categories } = useCategories();
  const { data: user } = useUser();
  const { fetchApplications } = useListCandidateApplications();
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  // Fetch applications for candidate once on mount/user change
  useEffect(() => {
    let mounted = true;
    const loadApplications = async () => {
      if (!user || user.role !== 'candidate') {
        if (mounted) setAppliedJobIds(new Set());
        return;
      }
      try {
        const res = await fetchApplications({ page: 1, pageSize: 100 });
        const activeStatuses = [
          'APPLIED',
          'PRE_SHORTLIST_PENDING',
          'PRE_SHORTLIST_SUBMITTED',
          'INTERVIEW',
          'OFFER',
        ];
        const appliedIds = new Set<number>(
          (res.applications || [])
            .filter((a) => activeStatuses.includes(a.status))
            .map((a) => a.jobId)
        );
        if (mounted) {
          setAppliedJobIds(appliedIds);
        }
      } catch {
        // ignore errors
      }
    };
    loadApplications();
    return () => {
      mounted = false;
    };
  }, [user, fetchApplications]);

  const handleApplySuccess = useCallback((jobId: number) => {
    setAppliedJobIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    setTitle('Find Jobs');
  }, [setTitle]);

  // --- Derived State from URL (The Source of Truth) ---
  const urlPage = Number(searchParams.get('page')) || 1;
  const urlSort =
    (searchParams.get('sort') as SortOption) ||
    (searchParams.get('resumeId') ? 'EMBEDDING_SCORE' : 'MOST_RELEVANT');
  const urlQ = searchParams.get('q') || '';
  const urlResumeId = searchParams.get('resumeId');
  const urlLocation = searchParams.get('location') || '';
  // --- Salary URL state (currency read FIRST — max default depends on it) ---
  const salaryCurrencyParam = searchParams.get('salaryCurrency');
  const urlSalaryCurrency: SupportedCurrency | undefined = isSupportedCurrency(
    salaryCurrencyParam
  )
    ? (salaryCurrencyParam as SupportedCurrency)
    : undefined;

  const minSalaryParam = searchParams.get('minSalary');
  const urlMinSalary = minSalaryParam !== null ? Number(minSalaryParam) : 0;

  const maxSalaryParam = searchParams.get('maxSalary');
  const urlMaxSalary =
    maxSalaryParam !== null
      ? Number(maxSalaryParam)
      : capFor(urlSalaryCurrency);
  const urlCategories = useMemo(
    () => searchParams.getAll('categoryId'),
    [searchParams]
  );
  const urlTypes = useMemo(() => searchParams.getAll('type'), [searchParams]);
  const urlSkills = useMemo(() => searchParams.getAll('skill'), [searchParams]);

  const checkedMap = useMemo(
    () => ({
      Categories: urlCategories,
      'Type of Employment': urlTypes,
      Skills: urlSkills,
    }),
    [urlCategories, urlTypes, urlSkills]
  );

  // --- Local States for Inputs (to allow typing/sliding without immediate URL lag) ---
  const [localSearchTerm, setLocalSearchTerm] = useState(urlQ);
  const [localLocation, setLocalLocation] = useState(urlLocation);
  const [localSalaryMin, setLocalSalaryMin] = useState(urlMinSalary);
  const [localSalaryMax, setLocalSalaryMax] = useState(urlMaxSalary);
  const [localSalaryCurrency, setLocalSalaryCurrency] = useState<
    SupportedCurrency | undefined
  >(urlSalaryCurrency);

  // Sync local input state when URL changes (e.g. Back button)
  useEffect(() => {
    setLocalSearchTerm(urlQ);
  }, [urlQ]);
  useEffect(() => {
    setLocalLocation(urlLocation);
  }, [urlLocation]);
  useEffect(() => {
    setLocalSalaryMin(urlMinSalary);
  }, [urlMinSalary]);
  useEffect(() => {
    setLocalSalaryMax(urlMaxSalary);
  }, [urlMaxSalary]);
  useEffect(() => {
    setLocalSalaryCurrency(urlSalaryCurrency);
  }, [urlSalaryCurrency]);

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const salaryFilterRef = useRef<{ reset: () => void } | null>(null);

  // Fetch skills based on search term
  const { skills: filteredSkills, fetchSkills } = useSkillsFilter();

  useEffect(() => {
    fetchSkills(localSearchTerm);
  }, [localSearchTerm, fetchSkills]);

  const filterGroups = useMemo(() => {
    return INITIAL_FILTER_GROUPS.map((group) => {
      if (group.title === 'Categories') {
        const sortedItems = categories
          .map((cat) => ({ label: cat.name, value: cat.id }))
          .sort((a, b) => {
            const aSelected = urlCategories.includes(String(a.value));
            const bSelected = urlCategories.includes(String(b.value));
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return a.label.localeCompare(b.label);
          });
        return { ...group, items: sortedItems };
      }
      if (group.title === 'Skills') {
        const sortedItems = filteredSkills
          .map((skill) => ({ label: skill.name }))
          .sort((a, b) => {
            const aSelected = urlSkills.includes(a.label);
            const bSelected = urlSkills.includes(b.label);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return a.label.localeCompare(b.label);
          });
        return { ...group, items: sortedItems };
      }
      if (group.title === 'Type of Employment') {
        const sortedItems = [...group.items].sort((a, b) => {
          const aSelected = urlTypes.includes(a.label);
          const bSelected = urlTypes.includes(b.label);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return 0;
        });
        return { ...group, items: sortedItems };
      }
      return group;
    });
  }, [categories, filteredSkills, urlCategories, urlTypes, urlSkills]);

  // Helper to update URL
  // NOTE: reads `searchParams` via the existing ref to avoid `updateURL`
  // becoming a new reference on every render, which would re-fire any effect
  // that depends on `updateURL` (causing the salary debounce effect to push
  // the same URL repeatedly and triggering infinite GET requests).
  const updateURL = useCallback(
    (params: Record<string, string | string[] | number | null>) => {
      const current = searchParamsRef.current ?? searchParams;
      const newParams = new URLSearchParams(current.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (
          value === null ||
          value === '' ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.delete(key);
          value.forEach((v) => newParams.append(key, String(v)));
        } else {
          newParams.set(key, String(value));
        }
      });
      // Always reset to page 1 when filters change (unless page is explicitly provided)
      if (!('page' in params)) {
        newParams.set('page', '1');
      }
      const queryString = newParams.toString().replace(/\+/g, '%20');
      router.push(`${pathname}?${queryString}`, { scroll: false });
    },
    [router, pathname]
  );

  // --- Handlers ---
  const handleToggle = (
    groupTitle: string,
    itemLabel: string,
    itemValue?: string | number
  ) => {
    const identifier =
      groupTitle === 'Categories' ? String(itemValue) : itemLabel;
    const currentList =
      groupTitle === 'Categories'
        ? urlCategories
        : groupTitle === 'Type of Employment'
        ? urlTypes
        : urlSkills;

    const nextList = currentList.includes(identifier)
      ? currentList.filter((i) => i !== identifier)
      : [...currentList, identifier];

    const paramKey =
      groupTitle === 'Categories'
        ? 'categoryId'
        : groupTitle === 'Type of Employment'
        ? 'type'
        : 'skill';

    updateURL({ [paramKey]: nextList });
  };

  const handleSearchTermChange = (term: string) => {
    setLocalSearchTerm(term);
  };

  const handleLocationChange = (loc: string) => {
    setLocalLocation(loc);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedTerm = localSearchTerm.trim();
      if (trimmedTerm !== urlQ) {
        updateURL({ q: trimmedTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm, urlQ, updateURL]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedLocation = localLocation.trim();
      if (trimmedLocation !== urlLocation) {
        updateURL({ location: trimmedLocation });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localLocation, urlLocation, updateURL]);

  const handleSelectSort = (option: SortOption) => {
    updateURL({ sort: option });
  };

  const handleSalaryChange = useCallback((min: number, max: number) => {
    setLocalSalaryMin(min);
    setLocalSalaryMax(max);
  }, []);

  const handleCurrencyChange = useCallback(
    (currency: SupportedCurrency | undefined) => {
      setLocalSalaryCurrency(currency);
      if (currency === undefined) {
        setLocalSalaryMin(0);
        setLocalSalaryMax(SALARY_MAX_CAP);
        return;
      }
      // Reset salary range to the full range of the new currency.
      // Clamping would keep a stale USD cap (500k) when switching to VND,
      // re-introducing the exact bug this feature fixes.
      const newCap = capFor(currency);
      setLocalSalaryMin(0);
      setLocalSalaryMax(newCap);
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentCap = capFor(localSalaryCurrency);
      const isPristine =
        localSalaryMin === 0 &&
        localSalaryMax === currentCap &&
        localSalaryCurrency === undefined;

      if (isPristine) {
        // Filter is off — remove all salary params from URL
        if (
          urlMinSalary !== 0 ||
          urlMaxSalary !== capFor(urlSalaryCurrency) ||
          urlSalaryCurrency !== undefined
        ) {
          updateURL({ minSalary: null, maxSalary: null, salaryCurrency: null });
        }
      } else {
        // Guard: only write to URL if the derived state actually differs
        // from what's already in the URL. Prevents an infinite loop where
        // updateURL → router.push → re-render → effect re-fires → updateURL.
        const intendedMin = localSalaryMin > 0 ? localSalaryMin : null;
        const intendedMax = localSalaryMax < currentCap ? localSalaryMax : null;
        const intendedCurrency = localSalaryCurrency ?? null;

        const minChanged =
          intendedMin !== (urlMinSalary > 0 ? urlMinSalary : null);
        const maxChanged =
          intendedMax !==
          (urlMaxSalary < capFor(urlSalaryCurrency) ? urlMaxSalary : null);
        const currencyChanged =
          intendedCurrency !== (urlSalaryCurrency ?? null);

        if (minChanged || maxChanged || currencyChanged) {
          updateURL({
            minSalary: intendedMin,
            maxSalary: intendedMax,
            salaryCurrency: intendedCurrency,
          });
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    localSalaryMin,
    localSalaryMax,
    localSalaryCurrency,
    urlMinSalary,
    urlMaxSalary,
    urlSalaryCurrency,
    updateURL,
  ]);

  const setCurrentPage = (page: number) => {
    updateURL({ page });
  };

  const handleReset = () => {
    setLocalSearchTerm('');
    setLocalLocation('');
    setLocalSalaryMin(0);
    setLocalSalaryMax(SALARY_MAX_CAP);
    setLocalSalaryCurrency(undefined);
    salaryFilterRef.current?.reset();
    // Redirect to the base path to clear all query params including resumeId
    router.push(pathname);
  };

  const { fetchJobs, loading: searchLoading } = useListJobs();
  const { fetchRecommendations, loading: recommendationsLoading } =
    useRecommendJobs();

  const loading = searchLoading || recommendationsLoading;

  // --- Main Data Fetching Effect (Reactive to URL) ---
  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const selectedEmploymentTypes = urlTypes
          .map((label) => getEmploymentTypeFromLabel(label))
          .filter((type): type is EmploymentType => type !== undefined);

        const queryParams = {
          page: urlPage,
          pageSize: PAGE_SIZE,
          sort: urlSort,
          q: urlQ,
          location: urlLocation,
          type:
            selectedEmploymentTypes.length > 0
              ? selectedEmploymentTypes
              : undefined,
          categories:
            urlCategories.length > 0 ? urlCategories.map(Number) : undefined,
          salaryMin: urlMinSalary > 0 ? urlMinSalary : undefined,
          salaryMax:
            urlMaxSalary < capFor(urlSalaryCurrency) ? urlMaxSalary : undefined,
          currency: urlSalaryCurrency,
          skills: urlSkills.length > 0 ? urlSkills : undefined,
        };

        let result;
        if (urlResumeId) {
          result = await fetchRecommendations(Number(urlResumeId), queryParams);
        } else {
          result = await fetchJobs(queryParams, {
            signal: abortController.signal,
          });
        }

        if (result) {
          setTotal(result.total);
          setTotalPages(Math.max(result.totalPages || 1, 1));
          setJobs(result.jobs);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('[FindJobsPage] failed to fetch jobs:', error);
        }
      }
    };

    fetchData();
    return () => abortController.abort();
  }, [
    urlPage,
    urlSort,
    urlQ,
    urlResumeId,
    urlLocation,
    urlMinSalary,
    urlMaxSalary,
    urlSalaryCurrency,
    urlCategories,
    urlTypes,
    urlSkills,
    fetchJobs,
    fetchRecommendations,
  ]);

  return (
    <>
      <FindJobsHeroSection
        searchTerm={localSearchTerm}
        location={localLocation}
        setSearchTerm={handleSearchTermChange}
        setLocation={handleLocationChange}
      />

      {urlResumeId && (
        <div className="container mx-auto px-4 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-lg text-white shadow-md">
                <BriefcaseBusiness size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recommended for you
                </h2>
                <p className="text-slate-600 text-sm">
                  We've analyzed your resume and found these matching
                  opportunities.
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              Clear Recommendations
            </button>
          </div>
        </div>
      )}

      <JobListSection
        jobs={jobs}
        isLoading={loading}
        total={total}
        totalPages={totalPages}
        currentPage={urlPage}
        setCurrentPage={setCurrentPage}
        selectedSort={urlSort}
        handleSelectSort={handleSelectSort}
        filterGroups={filterGroups}
        checkedMap={checkedMap}
        handleToggle={handleToggle}
        onSalaryChange={handleSalaryChange}
        onCurrencyChange={handleCurrencyChange}
        currency={localSalaryCurrency}
        salaryFilterRef={salaryFilterRef}
        handleReset={handleReset}
        salaryMin={localSalaryMin}
        salaryMax={localSalaryMax}
        appliedJobIds={appliedJobIds}
        onApplySuccess={handleApplySuccess}
      />
    </>
  );
}
