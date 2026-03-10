'use client';

import {
  ArrowRight,
  Briefcase,
  Code,
  Globe,
  Paintbrush,
  Wallet,
  Wrench,
} from 'lucide-react';
import CategoryTab from '@/components/brown-companies/ending/CategoryTab';
import CompanyCard from '@/components/brown-companies/ending/CompanyCard';
import { companyService } from '@/services/companyService';
import type { CompanyCategory } from '@/types/company';
import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';

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
  const [selectedCategory, setSelectedCategory] = useState<CompanyCategory>('design');

  const filteredCompanies = useMemo(
    () => companies.filter((company) => company.category === selectedCategory),
    [companies, selectedCategory]
  );

  const selectedCategoryName =
    categories.find((category) => category.id === selectedCategory)?.name ?? 'Design';

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

        <div className="mt-10 flex gap-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <CategoryTab
              key={category.name}
              name={category.name}
              icon={category.icon}
              active={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}

          <button
            type="button"
            className="hidden h-12 w-12 shrink-0 items-center justify-center self-center rounded-md bg-indigo-600 text-white shadow-xl xl:inline-flex"
            aria-label="More categories"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
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
