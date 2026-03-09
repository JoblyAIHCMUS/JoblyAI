import { useMemo, useState } from 'react';

export function usePagination(totalPages = 33) {
  const [currentPage, setCurrentPage] = useState(1);

  const middlePages = useMemo(() => [2, 3, 4, 5], []);

  const goPrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return {
    currentPage,
    middlePages,
    totalPages,
    setCurrentPage,
    goPrev,
    goNext,
  };
}
