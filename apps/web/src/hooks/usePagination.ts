import { useMemo } from 'react';

// Hàm tạo mảng số trang cho pagination, có thể test riêng
export function getPaginationPages(currentPage: number, totalPages: number, siblingCount = 1) {
  const totalNumbers = siblingCount * 2 + 5; // 5: first, last, current, 2 ellipsis

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: (number | string)[] = [];

  pages.push(1);

  if (showLeftEllipsis) {
    pages.push('...');
  }

  const left = showLeftEllipsis ? leftSibling : 2;
  const right = showRightEllipsis ? rightSibling : totalPages - 1;

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
}

export function usePagination(
  currentPage: number,
  setCurrentPage: (page: number) => void,
  totalPages: number,
  siblingCount = 1
) {
  // Dynamic pages array for pagination UI
  const pages = useMemo(() => getPaginationPages(currentPage, totalPages, siblingCount), [currentPage, totalPages, siblingCount]);

  const goPrev = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };

  const goNext = () => {
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  };

  return {
    pages,
    goPrev,
    goNext,
  };
}
