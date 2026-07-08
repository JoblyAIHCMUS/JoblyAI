import { COMPANY_CATEGORIES } from '@/mocks/companyCategories';
import { COMPANIES_BY_CATEGORY_MOCK } from '@/mocks/companies';
import { COMPANY_PROFILE_OVERRIDES } from '@/mocks/companyProfiles';
import { RECOMMENDED_COMPANIES_MOCK } from '@/mocks/recommendedCompanies';
import type { Company } from '@/api-client/company';
import type {
  CompanyProfile,
  CompanyProfileStat,
} from '@/types/companyProfile';
import { renderDescription } from '@/lib/utils';

const categoryNameMap = new Map(
  COMPANY_CATEGORIES.map((category) => [category.id, category.name])
);

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
      : company.industry ?? recommendedCompany?.tag.label ?? '';
    const openJobsCount =
      company._count?.jobPostings ??
      categoryCompany?.openJobs ??
      recommendedCompany?.jobs ??
      0;
    const override = COMPANY_PROFILE_OVERRIDES[id];
    const website = company.websiteUrl ?? override?.website ?? '';

    const officeLocations =
      (company.locations && company.locations.length > 0) || company.location
        ? Array.from(
            new Set(
              [
                ...(company.location ? [company.location] : []),
                ...(company.locations || []),
              ].filter(Boolean)
            )
          )
        : override?.officeLocations ?? [];

    const team =
      company.employers && company.employers.length > 0
        ? company.employers.map((member) => {
            const nameParts = member.employer.name?.trim().split(/\s+/) ?? [];
            const firstName = member.employer.firstName ?? nameParts[0] ?? '';
            const lastName =
              member.employer.lastName ?? nameParts.slice(1).join(' ') ?? '';
            const fullName =
              [firstName, lastName].filter(Boolean).join(' ') ||
              member.employer.email;
            return {
              id: member.employerId,
              name: fullName,
              role: member.role || 'Member',
              avatarUrl:
                member.employer.avatarUrl ??
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  fullName
                )}`,
            };
          })
        : override?.team ?? [];

    const stats: CompanyProfileStat[] = [];
    if (override?.stats) {
      stats.push(...override.stats);
    } else {
      if (company.sizeRange) {
        stats.push({ label: 'Employees', value: company.sizeRange });
      }
      if (company.location) {
        stats.push({ label: 'Location', value: company.location });
      }
      if (company.industry || categoryName) {
        stats.push({
          label: 'Industry',
          value: company.industry ?? categoryName ?? 'Technology',
        });
      }
    }

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
          ''
      ),
      officeSummary:
        override?.officeSummary ??
        (company.location
          ? `${name} is based in ${company.location} and collaborates across hybrid offices and hubs.`
          : ''),
      officeLocations,
      contacts:
        override?.contacts ??
        (website
          ? [
              {
                type: 'website',
                label: website.replace(/^https?:\/\//, ''),
                href: website,
              },
            ]
          : []),
      stats,
      gallery:
        company.images && company.images.length > 0
          ? company.images
          : override?.gallery ?? [],
      team,
      openJobs: override?.openJobs ?? [],
    };
  },
};
