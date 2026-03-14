import { COMPANY_CATEGORIES } from '@/mocks/companyCategories';
import { COMPANIES_BY_CATEGORY_MOCK } from '@/mocks/companies';
import { COMPANY_PROFILE_OVERRIDES } from '@/mocks/companyProfiles';
import { RECOMMENDED_COMPANIES_MOCK } from '@/mocks/recommendedCompanies';
import type { CompanyProfile, CompanyTeamMember } from '@/types/companyProfile';
import type { SimilarJob } from '@/types/similarJob';

const categoryNameMap = new Map(
  COMPANY_CATEGORIES.map((category) => [category.id, category.name])
);

const fallbackGallery = [
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
];

const fallbackTeam: CompanyTeamMember[] = [
  {
    id: 'maya',
    name: 'Maya Thomas',
    role: 'People Lead',
    avatarUrl: 'https://i.pravatar.cc/160?img=45',
    instagramUrl: '#',
    linkedinUrl: '#',
  },
  {
    id: 'logan',
    name: 'Logan Cross',
    role: 'Head of Design',
    avatarUrl: 'https://i.pravatar.cc/160?img=13',
    instagramUrl: '#',
    linkedinUrl: '#',
  },
  {
    id: 'irene',
    name: 'Irene Fox',
    role: 'Engineering Manager',
    avatarUrl: 'https://i.pravatar.cc/160?img=29',
    instagramUrl: '#',
    linkedinUrl: '#',
  },
  {
    id: 'henry',
    name: 'Henry Miles',
    role: 'Product Director',
    avatarUrl: 'https://i.pravatar.cc/160?img=68',
    instagramUrl: '#',
    linkedinUrl: '#',
  },
];

const openJobTitles = [
  'Social Media Assistant',
  'Brand Designer',
  'Interactive Developer',
  'HR Manager',
  'Product Designer',
  'Growth Marketer',
];

const openJobLocations = [
  'Paris, France',
  'San Francisco, USA',
  'Hamburg, Germany',
  'Lucerne, Switzerland',
  'Remote',
  'London, UK',
];

function buildOpenJobs(companyName: string, totalJobs: number): SimilarJob[] {
  const total = Math.min(Math.max(totalJobs, 4), 6);

  return Array.from({ length: total }, (_, index) => ({
    id: index + 1,
    title: openJobTitles[index],
    company: companyName,
    location: openJobLocations[index],
    type: 'Full-Time',
    tag: index % 2 === 0 ? 'Design' : 'Marketing',
    logo: companyName.slice(0, 1).toUpperCase(),
    logoColor:
      index % 2 === 0
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-cyan-100 text-cyan-700',
  }));
}

export const companyProfileService = {
  getCompanyProfile(id: string): CompanyProfile | null {
    const categoryCompany = COMPANIES_BY_CATEGORY_MOCK.companies.find(
      (company) => company.id === id
    );
    const recommendedCompany = RECOMMENDED_COMPANIES_MOCK.find(
      (company) => company.id === id
    );

    if (!categoryCompany && !recommendedCompany) {
      return null;
    }

    const name = categoryCompany?.name ?? recommendedCompany?.name ?? 'Company';
    const logoUrl =
      categoryCompany?.logoUrl ?? recommendedCompany?.logo.imageUrl ?? '';
    const logoAlt =
      categoryCompany?.logoAlt ?? recommendedCompany?.logo.alt ?? `${name} logo`;
    const categoryName = categoryCompany?.categoryId
      ? categoryNameMap.get(categoryCompany.categoryId) ?? 'Technology'
      : recommendedCompany?.tag.label ?? 'Technology';
    const openJobsCount =
      categoryCompany?.openJobs ?? recommendedCompany?.jobs ?? 4;
    const override = COMPANY_PROFILE_OVERRIDES[id];
    const website =
      override?.website ?? `https://${name.toLowerCase().replace(/\s+/g, '')}.com`;

    return {
      id,
      name,
      logoUrl,
      logoAlt,
      website,
      breadcrumbLabel: override?.breadcrumbLabel ?? name,
      openJobsCount,
      description:
        override?.description ??
        recommendedCompany?.description ??
        `${name} is building products for modern teams and scaling across multiple markets with an emphasis on craft, speed, and reliable execution.`,
      officeSummary:
        override?.officeSummary ??
        `${name} teams collaborate across hybrid offices and distributed hubs worldwide`,
      officeLocations: override?.officeLocations ?? [
        { emoji: '🇺🇸', label: 'United States' },
        { emoji: '🇬🇧', label: 'United Kingdom' },
        { emoji: '🇩🇪', label: 'Germany' },
        { emoji: '🇸🇬', label: 'Singapore' },
      ],
      contacts: override?.contacts ?? [
        { type: 'website', label: website.replace(/^https?:\/\//, ''), href: website },
        {
          type: 'linkedin',
          label: `linkedin.com/company/${id}`,
          href: `https://www.linkedin.com/company/${id}`,
        },
      ],
      stats: override?.stats ?? [
        { label: 'Founded', value: '2017' },
        { label: 'Employees', value: `${Math.max(openJobsCount * 40, 120)}+` },
        { label: 'Location', value: `${Math.max(openJobsCount, 4)} countries` },
        { label: 'Industry', value: categoryName },
      ],
      gallery: override?.gallery ?? fallbackGallery,
      team: override?.team ?? fallbackTeam,
      openJobs: override?.openJobs ?? buildOpenJobs(name, openJobsCount),
    };
  },
};