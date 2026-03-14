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

type UseCategoryCompaniesOptions = {
  initialCategoryId?: string;
  initialCompanyId?: string;
};

export function useCategoryCompanies(
  companies: CompanyCardData[],
  categories: CompanyCategoryTab[],
  options?: UseCategoryCompaniesOptions
): UseCategoryCompaniesResult {
  const initialCategoryId = options?.initialCategoryId;
  const initialCompanyId = options?.initialCompanyId;

  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryId ?? categories[0]?.id ?? ''
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (categories.length === 0) {
      if (selectedCategory !== '') {
        setSelectedCategory('');
      }
      return;
    }

    const companyFromUrl = initialCompanyId
      ? companies.find((company) => company.id === initialCompanyId)
      : undefined;

    const categoryFromCompanyId = companyFromUrl?.categoryId;

    const preferredCategoryId =
      initialCategoryId &&
      categories.some((category) => category.id === initialCategoryId)
        ? initialCategoryId
        : categoryFromCompanyId &&
          categories.some((category) => category.id === categoryFromCompanyId)
        ? categoryFromCompanyId
        : categories[0].id;

    if (initialCategoryId && initialCategoryId !== selectedCategory) {
      const initialCategoryExists = categories.some(
        (category) => category.id === initialCategoryId
      );

      if (initialCategoryExists) {
        setSelectedCategory(initialCategoryId);
        return;
      }
    }

    if (!selectedCategory) {
      setSelectedCategory(preferredCategoryId);
      return;
    }

    const selectedCategoryStillExists = categories.some(
      (category) => category.id === selectedCategory
    );

    if (!selectedCategoryStillExists) {
      setSelectedCategory(preferredCategoryId);
    }
  }, [
    categories,
    companies,
    initialCategoryId,
    initialCompanyId,
    selectedCategory,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  const filteredCompanies = useMemo(
    () =>
      companies.filter((company) => company.categoryId === selectedCategory),
    [companies, selectedCategory]
  );

  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name ?? 'Category';

  const visibleCompanies = filteredCompanies.slice(0, visibleCount);

  useEffect(() => {
    if (!initialCompanyId) {
      return;
    }

    const companyIndex = filteredCompanies.findIndex(
      (company) => company.id === initialCompanyId
    );

    if (companyIndex < 0) {
      return;
    }

    const minimumVisibleCount = Math.max(PAGE_SIZE, companyIndex + 1);
    if (visibleCount < minimumVisibleCount) {
      setVisibleCount(minimumVisibleCount);
    }
  }, [filteredCompanies, initialCompanyId, visibleCount]);

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
