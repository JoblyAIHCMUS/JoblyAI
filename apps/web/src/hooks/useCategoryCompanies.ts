import type { CompanyCardData, CompanyCategoryTab } from '@/types/company';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 8;

type UseCategoryCompaniesResult = {
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedCategoryName: string;
  filteredCompanies: CompanyCardData[];
  visibleCompanies: CompanyCardData[];
  shouldShowViewMoreButton: boolean;
  loadMore: () => void;
};

export function useCategoryCompanies(
  companies: CompanyCardData[],
  categories: CompanyCategoryTab[]
): UseCategoryCompaniesResult {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  const filteredCompanies = useMemo(
    () => companies.filter((company) => company.categoryId === selectedCategory),
    [companies, selectedCategory]
  );

  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name ??
    categories[0].name;

  const visibleCompanies = filteredCompanies.slice(0, visibleCount);

  const shouldShowViewMoreButton =
    filteredCompanies.length > PAGE_SIZE &&
    visibleCount < filteredCompanies.length;

  const loadMore = () =>
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, filteredCompanies.length)
    );

  return {
    selectedCategory,
    setSelectedCategory,
    selectedCategoryName,
    filteredCompanies,
    visibleCompanies,
    shouldShowViewMoreButton,
    loadMore,
  };
}
