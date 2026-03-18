import { ApplicationItem, ApplicationStatusMeta } from '@/types/candidate';

interface ApplicationTableProps {
  filteredApplications: ApplicationItem[];
  paginatedApplications: ApplicationItem[];
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  statusMeta: ApplicationStatusMeta;
  visiblePages?: number[];
  goToPreviousPage?: () => void;
  goToNextPage?: () => void;
  goToPage?: (page: number) => void;
  renderRow: (item: ApplicationItem, index: number, tinted: boolean, statusMeta: ApplicationStatusMeta) => React.ReactNode;
}

export function ApplicationTable({
  filteredApplications,
  paginatedApplications,
  currentPage = 1,
  totalPages = 1,
  pageSize = 7,
  statusMeta,
  visiblePages = [],
  goToPreviousPage,
  goToNextPage,
  goToPage,
  renderRow,
}: ApplicationTableProps) {
  return (
    <>
      <div className="mt-4 flex flex-col gap-4 lg:mt-7 lg:gap-0">
        {filteredApplications.length > 0 && (
          <div className="hidden items-center gap-3 border-b border-[#eef1f6] px-4 py-3 text-sm font-medium text-[#7c8493] lg:grid lg:grid-cols-[48px_minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(120px,0.9fr)_minmax(110px,0.8fr)_24px] lg:px-5 xl:gap-5 xl:px-6 xl:grid-cols-[56px_221px_275px_194px_1fr_24px]">
            <p>#</p>
            <p>Company Name</p>
            <p>Roles</p>
            <p>Date Applied</p>
            <p>Status</p>
            <p className="text-right">Actions</p>
          </div>
        )}

        {paginatedApplications.map((item, index) =>
          renderRow(
            item,
            (currentPage - 1) * pageSize + index + 1,
            index % 2 === 1,
            statusMeta
          )
        )}

        {filteredApplications.length === 0 && (
          <div className="rounded-sm bg-[#f8fafc] px-6 py-10 text-center text-sm text-[#7c8493]">
            No applications found for this filter.
          </div>
        )}
      </div>

      {filteredApplications.length > 0 && totalPages > 1 && goToPreviousPage && goToNextPage && goToPage && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d6ddeb] text-[#515b6f] disabled:opacity-40"
            aria-label="Previous page"
          >
            {'<'}
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ${
                page === currentPage
                  ? 'bg-[#4640de] text-white'
                  : 'text-[#515b6f] hover:bg-[#f8fafc]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d6ddeb] text-[#515b6f] disabled:opacity-40"
            aria-label="Next page"
          >
            {'>'}
          </button>
        </div>
      )}
    </>
  );
}
