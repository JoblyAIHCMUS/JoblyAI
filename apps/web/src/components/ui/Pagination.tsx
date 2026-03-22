import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pages: (number | string)[];
  onPageChange: (page: number) => void;
  goPrev?: () => void;
  goNext?: () => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  pages,
  onPageChange,
  goPrev,
  goNext,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center gap-1 ${className}`} aria-label="Pagination">
      <button
        className="px-2 py-1 rounded disabled:opacity-50"
        onClick={() => (goPrev ? goPrev() : onPageChange(currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((page, idx) =>
        typeof page === 'number' ? (
          <button
            key={page}
            className={`px-2 py-1 rounded font-medium ${
              page === currentPage ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span key={`ellipsis-${idx}-${pages.slice(0, idx).filter(p => p === '...').length}`} className="px-2 py-1 text-slate-400 select-none">
            ...
          </span>
        )
      )}
      <button
        className="px-2 py-1 rounded disabled:opacity-50"
        onClick={() => (goNext ? goNext() : onPageChange(currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
