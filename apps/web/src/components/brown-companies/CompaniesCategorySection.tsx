'use client';

import { ArrowRight, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import CategoryTab from '@/components/brown-companies/category-section/CategoryTab';
import CompanyCard from '@/components/brown-companies/category-section/CompanyCard';
import { useCategoryCompanies } from '@/hooks/useCategoryCompanies';
import { useScrollCues } from '@/hooks/useScrollCues';
import { getCategoryIconByIndex } from '@/lib/categoryIcons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { companyService } from '@/services/companyService';

export default function CompaniesCategorySection() {
  const { companies } = companyService.getCompaniesByCategory();
  const categories = companyService.getCategories();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoryId') ?? undefined;
  const companyIdFromUrl = searchParams.get('companyId') ?? undefined;

  const {
    selectedCategory,
    setSelectedCategory,
    selectedCategoryName,
    filteredCompanies,
    visibleCompanies,
    shouldShowViewMoreButton,
    loadMore,
  } = useCategoryCompanies(companies, categories, {
    initialCategoryId: categoryIdFromUrl,
    initialCompanyId: companyIdFromUrl,
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('categoryId', categoryId);
    nextParams.delete('companyId');

    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const { tabsContainerRef, isCompactScreen, showLeftCue, showRightCue } =
    useScrollCues();

  return (
    <section className="relative overflow-hidden bg-[color:var(--bg-accent-primary)] px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
      <div
        className="absolute left-0 top-0 h-20 w-28 bg-white md:h-24 md:w-40"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />

      <div className="relative mx-auto max-w-7xl">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-4xl">
          Companies by Category
        </h2>

        <div className="relative mt-10">
          <div
            ref={tabsContainerRef}
            className="flex gap-6 overflow-x-auto pb-2 pr-4 xl:overflow-visible"
          >
            {categories.map((category, index) => (
              <CategoryTab
                key={category.id}
                name={category.name}
                icon={getCategoryIconByIndex(index)}
                active={selectedCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>

          {isCompactScreen && showLeftCue ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-start bg-gradient-to-r from-[color:var(--bg-accent-primary)] to-transparent">
              <ChevronLeft className="h-5 w-5 animate-pulse text-indigo-600" />
            </div>
          ) : null}

          {isCompactScreen && showRightCue ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-end bg-gradient-to-l from-[color:var(--bg-accent-primary)] to-transparent">
              <ChevronRight className="h-5 w-5 animate-pulse text-indigo-600" />
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Wrench className="h-5 w-5" />
          </span>
          <p className="text-3xl font-semibold leading-8 tracking-tight text-slate-900">
            {filteredCompanies.length} Results
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {shouldShowViewMoreButton ? (
          <button
            type="button"
            onClick={loadMore}
            className="mt-8 inline-flex items-center gap-2 text-base font-semibold leading-6 tracking-tight text-indigo-600"
          >
            View more {selectedCategoryName} companies
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
