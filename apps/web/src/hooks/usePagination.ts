import { useMemo } from 'react';

export function usePagination(currentPage: number, setCurrentPage: (page: number) => void, totalPages: number) {
  // Dynamic pages array for pagination UI
  const pages = useMemo(() => {
    const arr: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
      return arr;
    }
    if (currentPage < 4) {
      for (let i = 1; i <= 4; i++) arr.push(i);
      arr.push('...');
      arr.push(totalPages);
      return arr;
    }
    if (currentPage > totalPages - 3) {
      arr.push(1);
      arr.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) arr.push(i);
      return arr;
    }
    arr.push(1);
    arr.push('...');
    arr.push(currentPage - 1);
    arr.push(currentPage);
    arr.push(currentPage + 1);
    arr.push('...');
    arr.push(totalPages);
    return arr;
  }, [currentPage, totalPages]);

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
