'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import Pagination from '@/components/ui/Pagination';
import CompanyCard from '@/components/browse-companies/recommended/CompanyCard';
import { usePagination } from '@/hooks/usePagination';
import { useListCompanies } from '@/api-hook/company/useListCompanies';
import { usePageTitle } from '@/contexts/page-title-context';

export default function BrowseCompaniesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading page...</div>}>
      <BrowseCompaniesPageContent />
    </Suspense>
  );
}

function BrowseCompaniesPageContent() {
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setTitle('Browse Companies');
  }, [setTitle]);

  // --- Parse state from URL ---
  const urlQ = searchParams.get('q') || '';
  const urlLocation = searchParams.get('location') || '';
  const urlPage = Number(searchParams.get('page')) || 1;

  // --- API search hook ---
  const { fetchCompanies, loading, data } = useListCompanies();

  // Fetch companies whenever URL state changes
  useEffect(() => {
    fetchCompanies({
      q: urlQ || undefined,
      location: urlLocation || undefined,
      page: urlPage,
      pageSize: 9, // Showing 9 companies per page in a 3-column grid
    });
  }, [urlQ, urlLocation, urlPage, fetchCompanies]);

  const pendingUpdatesRef = useRef<Record<string, string | number | null | undefined>>({});
  const timerRef = useRef<any>(null);

  // --- Helper to update URL params ---
  const updateUrl = (newParams: Record<string, string | number | null | undefined>) => {
    // Accumulate query parameter updates
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...newParams,
    };

    if (timerRef.current) return;

    // Batch updates to avoid Next.js router race condition/overwrite
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(pendingUpdatesRef.current).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset to page 1 unless page itself was updated
      if (!('page' in pendingUpdatesRef.current)) {
        params.set('page', '1');
      }

      router.push(`${pathname}?${params.toString()}`);

      pendingUpdatesRef.current = {};
      timerRef.current = null;
    }, 0);
  };


  // --- Search actions ---
  const handleSearchTermChange = (term: string) => {
    updateUrl({ q: term });
  };

  const handleLocationChange = (loc: string) => {
    updateUrl({ location: loc });
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page });
  };

  const handleClearSearch = () => {
    updateUrl({
      q: null,
      location: null,
      page: 1,
    });
  };

  // Pagination hook values
  const totalPages = data?.totalPages || 1;
  const { pages, goPrev, goNext } = usePagination(
    urlPage,
    handlePageChange,
    totalPages
  );

  const companiesList = data?.companies || [];
  const totalCompanies = data?.total || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero / Search Section */}
      <FindJobsHeroSection
        searchTerm={urlQ}
        location={urlLocation}
        setSearchTerm={handleSearchTermChange}
        setLocation={handleLocationChange}
        placeholder="Company name or keyword"
      />

      {/* Main content grid */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header info bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              All Companies
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? 'Searching...' : `Showing ${companiesList.length} of ${totalCompanies} companies`}
            </p>
          </div>
        </div>

        {/* Main Cards List or States */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[260px] animate-pulse rounded-[10px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : companiesList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {companiesList.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={urlPage}
                  totalPages={totalPages}
                  pages={pages}
                  onPageChange={handlePageChange}
                  goPrev={goPrev}
                  goNext={goNext}
                  className="justify-center"
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 py-16 text-center">
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No companies found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search keywords or location.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Clear search query
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
