'use client';

import CompanyDetailHero from '@/components/company-profile/CompanyDetailHero';
import CompanyOverviewSection from '@/components/company-profile/CompanyOverviewSection';
import CompanyTeamSection from '@/components/company-profile/CompanyTeamSection';
import JobDetailSimilarJobs from '@/components/job-detail/JobDetailSimilarJobs';
import { companyProfileService } from '../../../services/companyProfileService';
import { useEffect } from 'react';
import { useGetCompanyBySlug } from '@/api-hook/company/useGetCompanyBySlug';

export default function BrowseCompaniesCompanyProfilePage({
  companySlug,
}: {
  companySlug: string;
}) {
  const {
    fetchCompanyBySlug,
    loading,
    error,
    data: company,
  } = useGetCompanyBySlug();

  useEffect(() => {
    void fetchCompanyBySlug(companySlug);
  }, [companySlug, fetchCompanyBySlug]);

  const displayCompany = company
    ? companyProfileService.getCompanyProfile(company)
    : null;

  if (loading && !displayCompany) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-white text-slate-600">
        Loading Company Profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-white text-red-600">
        Failed to load Company Profile.
      </div>
    );
  }

  if (!displayCompany) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-white text-slate-600">
        Company Profile not found.
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <CompanyDetailHero company={displayCompany} />
      <CompanyOverviewSection company={displayCompany} />
      <CompanyTeamSection company={displayCompany} />
      <JobDetailSimilarJobs title="Open Jobs" jobs={displayCompany.openJobs} />
    </div>
  );
}
