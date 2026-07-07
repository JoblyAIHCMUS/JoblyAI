import { COMPANY_CATEGORIES } from '@/mocks/companyCategories';
import { COMPANIES_BY_CATEGORY_MOCK } from '@/mocks/companies';
import { COMPANY_PROFILE_OVERRIDES } from '@/mocks/companyProfiles';
import { RECOMMENDED_COMPANIES_MOCK } from '@/mocks/recommendedCompanies';
import type { Company } from '@/api-client/company';
import type { CompanyProfile, CompanyTeamMember } from '@/types/companyProfile';
import type { SimilarJob } from '@/types/similarJob';
import { renderDescription } from '@/lib/utils';

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
  },
  {
    id: 'logan',
    name: 'Logan Cross',
    role: 'Head of Design',
    avatarUrl: 'https://i.pravatar.cc/160?img=13',
  },
  {
    id: 'irene',
    name: 'Irene Fox',
    role: 'Engineering Manager',
    avatarUrl: 'https://i.pravatar.cc/160?img=29',
  },
  {
    id: 'henry',
    name: 'Henry Miles',
    role: 'Product Director',
    avatarUrl: 'https://i.pravatar.cc/160?img=68',
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
  getCompanyProfile(company: Company): CompanyProfile {
    const id = company.slug;
    const categoryCompany = COMPANIES_BY_CATEGORY_MOCK.companies.find(
      (entry) => entry.id === id
    );
    const recommendedCompany = RECOMMENDED_COMPANIES_MOCK.find(
      (entry) => entry.id === id
    );

    const name =
      company.name ??
      categoryCompany?.name ??
      recommendedCompany?.name ??
      'Company';
    const logoUrl =
      company.logoUrl ??
      categoryCompany?.logoUrl ??
      recommendedCompany?.logo.imageUrl ??
      '';
    const categoryName = categoryCompany?.categoryId
      ? categoryNameMap.get(categoryCompany.categoryId) ?? 'Technology'
      : company.industry ?? recommendedCompany?.tag.label ?? 'Technology';
    const openJobsCount =
      categoryCompany?.openJobs ?? recommendedCompany?.jobs ?? 4;
    const override = COMPANY_PROFILE_OVERRIDES[id];
    const website =
      company.websiteUrl ??
      override?.website ??
      `https://${name.toLowerCase().replace(/\s+/g, '')}.com`;

    const officeLocations = company.location
      ? [company.location]
      : (override?.officeLocations ?? [
          'United States',
          'United Kingdom',
          'Germany',
          'Singapore',
        ]);

    const team = company.employers && company.employers.length > 0
      ? company.employers.map((member) => {
          const nameParts = member.employer.name?.trim().split(/\s+/) ?? [];
          const firstName = member.employer.firstName ?? nameParts[0] ?? '';
          const lastName = member.employer.lastName ?? nameParts.slice(1).join(' ') ?? '';
          const fullName = [firstName, lastName].filter(Boolean).join(' ') || member.employer.email;
          return {
            id: member.employerId,
            name: fullName,
            role: member.role || 'Member',
            avatarUrl: member.employer.avatarUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          };
        })
      : override?.team ?? fallbackTeam;

    return {
      id,
      name,
      logoUrl,
      website,
      openJobsCount,
      description: renderDescription(
        company.description ??
          override?.description ??
          recommendedCompany?.description ??
          `${name} is building products for modern teams and scaling across multiple markets with an emphasis on craft, speed, and reliable execution.`
      ),
      officeSummary:
        override?.officeSummary ??
        (company.location
          ? `${name} is based in ${company.location} and collaborates across hybrid offices and hubs.`
          : `${name} teams collaborate across hybrid offices and distributed hubs worldwide`),
      officeLocations,
      contacts: override?.contacts ?? [
        {
          type: 'website',
          label: website.replace(/^https?:\/\//, ''),
          href: website,
        },
        {
          type: 'linkedin',
          label: `linkedin.com/company/${id}`,
          href: `https://www.linkedin.com/company/${id}`,
        },
      ],
      stats: override?.stats ?? [
        { label: 'Founded', value: '2017' },
        { label: 'Employees', value: `${Math.max(openJobsCount * 40, 120)}+` },
        {
          label: 'Location',
          value: company.location
            ? company.location
            : `${Math.max(openJobsCount, 4)} countries`,
        },
        { label: 'Industry', value: categoryName },
      ],
      gallery: override?.gallery ?? fallbackGallery,
      team,
      openJobs: override?.openJobs ?? buildOpenJobs(name, openJobsCount),
    };
  },
};
