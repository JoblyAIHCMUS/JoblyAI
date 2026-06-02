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
    <nav
      className={`flex items-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      <button
        className="px-2 py-1 rounded disabled:opacity-50"
        onClick={() => (goPrev ? goPrev() : onPageChange(currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((page, idx) => {
        if (typeof page === 'number') {
          return (
            <button
              key={`page-${page}`}
              className={`px-2 py-1 rounded font-medium ${
                page === currentPage
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={
                page === currentPage
                  ? `Current page, page ${page}`
                  : `Go to page ${page}`
              }
            >
              {page}
            </button>
          );
        } else {
          // Tối ưu key cho dấu ...
          const ellipsisKey = `ellipsis-${idx}-${
            pages.filter((p, i) => p === '...' && i <= idx).length
          }`;
          return (
            <span
              key={ellipsisKey}
              className="px-2 py-1 text-slate-400 select-none"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }
      })}
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
