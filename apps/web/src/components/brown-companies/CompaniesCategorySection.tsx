'use client';

import {
  ArrowRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Code,
  Globe,
  Paintbrush,
  Wallet,
  Wrench,
} from 'lucide-react';
import CategoryTab from '@/components/brown-companies/category-section/CategoryTab';
import CompanyCard from '@/components/brown-companies/category-section/CompanyCard';
import { companyService } from '@/services/companyService';
import type { CompanyCategory } from '@/types/company';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Category = {
  id: CompanyCategory;
  name: string;
  icon: ComponentType<{ className?: string }>;
};

const categories: Category[] = [
  { id: 'design', name: 'Design', icon: Paintbrush },
  { id: 'fintech', name: 'Fintech', icon: Wallet },
  { id: 'hosting', name: 'Hosting', icon: Globe },
  { id: 'business-service', name: 'Business Service', icon: Briefcase },
  { id: 'developer', name: 'Developer', icon: Code },
];

export default function CompaniesCategorySection() {
  const { companies } = companyService.getCompaniesByCategory();
  const [selectedCategory, setSelectedCategory] =
    useState<CompanyCategory>('design');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const [showLeftCue, setShowLeftCue] = useState(false);
  const [showRightCue, setShowRightCue] = useState(false);

  const filteredCompanies = useMemo(
    () => companies.filter((company) => company.category === selectedCategory),
    [companies, selectedCategory]
  );

  const selectedCategoryName =
    categories.find((category) => category.id === selectedCategory)?.name ??
    'Design';

  useEffect(() => {
    const updateScrollCues = () => {
      const tabsElement = tabsContainerRef.current;
      if (!tabsElement) {
        return;
      }

      const compact = window.matchMedia('(max-width: 1279px)').matches;
      setIsCompactScreen(compact);

      if (!compact) {
        setShowLeftCue(false);
        setShowRightCue(false);
        return;
      }

      const canScroll = tabsElement.scrollWidth > tabsElement.clientWidth + 1;
      setShowLeftCue(canScroll && tabsElement.scrollLeft > 4);
      setShowRightCue(
        canScroll &&
          tabsElement.scrollLeft <
            tabsElement.scrollWidth - tabsElement.clientWidth - 4
      );
    };

    updateScrollCues();

    const tabsElement = tabsContainerRef.current;
    tabsElement?.addEventListener('scroll', updateScrollCues, {
      passive: true,
    });
    window.addEventListener('resize', updateScrollCues);

    return () => {
      tabsElement?.removeEventListener('scroll', updateScrollCues);
      window.removeEventListener('resize', updateScrollCues);
    };
  }, []);

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
            {categories.map((category) => (
              <CategoryTab
                key={category.name}
                name={category.name}
                icon={category.icon}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
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
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        <button
          type="button"
          className="mt-8 inline-flex items-center gap-2 text-base font-semibold leading-6 tracking-tight text-indigo-600"
        >
          View more {selectedCategoryName} companies
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
