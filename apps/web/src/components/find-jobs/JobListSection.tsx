'use client';

import {
  Check,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import FilterGroup from '@/components/find-jobs/FilterGroup';
import JobCard from '@/components/find-jobs/JobCard';
import { useFilters } from '@/hooks/useFilters';
import { useJobs } from '@/hooks/useJobs';
import { usePagination } from '@/hooks/usePagination';
import { useState } from 'react';

export default function JobListSection() {
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


  // Số job mỗi trang, có thể tuỳ chỉnh
  const pageSize = 5;

  // Lấy currentPage từ pagination trước, truyền vào useJobs
  const [currentPage, setCurrentPage] = useState(1);
  const {
    jobs,
    totalPages,
    sortOptions,
    isSortOpen,
    setIsSortOpen,
    selectedSort,
    handleSelectSort,
    viewMode,
    setViewMode,
  } = useJobs(currentPage, pageSize);

  // Pagination nhận currentPage, setCurrentPage, totalPages
  const {
    pages,
    goPrev,
    goNext,
  } = usePagination(currentPage, setCurrentPage, totalPages);

  return (
    <section className="bg-white py-10 lg:py-[72px]">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[234px_1fr] lg:gap-10 lg:px-8">
        <aside className="hidden flex-col gap-3 lg:flex">
          {filterGroups.map((group) => (
            <FilterGroup
              key={group.title}
              title={group.title}
              items={group.items}
              checked={checkedMap[group.title] ?? []}
              expanded={expandedMap[group.title] ?? true}
              onToggle={handleToggle}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-[32px] font-semibold leading-10 text-slate-900">
                All Jobs
              </h2>
              <p className="text-base leading-6 text-slate-500">
                Showing 73 results
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex items-center gap-3">
                <span className="text-sm font-medium leading-5 text-slate-500">
                  Sort by:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-medium leading-5 text-slate-900"
                >
                  {selectedSort}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isSortOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-8 z-20 min-w-[180px] origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg transition-all duration-200 ease-out ${
                    isSortOpen
                      ? 'translate-y-0 scale-100 opacity-100'
                      : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                  }`}
                >
                  {sortOptions.map((option) => {
                    const isActive = selectedSort === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectSort(option)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{option}</span>
                        {isActive ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={`hidden h-10 w-10 items-center justify-center rounded lg:flex ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-white text-slate-400'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={`hidden h-10 w-10 items-center justify-center rounded lg:flex ${
                  viewMode === 'list'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-white text-slate-400'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900"
            >
              <span>More Filters</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isMobileFiltersOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
                : 'flex flex-col gap-3'
            }
          >
            {jobs.map((job) => (
              <JobCard key={job.title} job={job} viewMode={viewMode} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pages={pages}
            onPageChange={setCurrentPage}
            goPrev={goPrev}
            goNext={goNext}
            className="pt-2 justify-center"
          />
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 px-4 py-8 transition-opacity duration-200 lg:hidden ${
          isMobileFiltersOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="mx-auto flex h-full w-full max-w-[520px] items-center justify-center">
          <div className="-translate-y-4 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">
                More Filters
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-sm font-medium text-slate-500"
              >
                X
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {filterGroups.map((group) => (
                  <FilterGroup
                    key={`mobile-${group.title}`}
                    title={group.title}
                    items={group.items}
                    checked={checkedMap[group.title] ?? []}
                    expanded={expandedMap[group.title] ?? true}
                    onToggle={handleToggle}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={handleApplyMobileFilters}
                className="h-11 w-full rounded-[6px] bg-indigo-600 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
