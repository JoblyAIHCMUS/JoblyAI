'use client';

import { CompanyProfileBasicInfo } from '@/components/employer/companyProfileBasicInfo';
import { Separator } from '@/components/ui/separator';
import { CompanyProfileAbout } from '@/components/employer/companyProfileAbout';
import { useGetEmployerProfile } from '@/api-hook/employer/useGetEmployerProfile';
import { useGetCompany } from '@/api-hook/company/useGetCompany';
import { useEffect, useState } from 'react';

export default function EmployerCompanyProfilePage() {
  const {
    data: employer,
    loading: loadingEmployer,
    error: errorEmployer,
  } = useGetEmployerProfile();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const {
    data: company,
    loading: loadingCompany,
    error: errorCompany,
    fetchCompany,
  } = useGetCompany();

  useEffect(() => {
    if (employer?.company?.id) {
      setCompanyId(employer.company.id);
      fetchCompany(employer.company.id);
    }
  }, [employer, fetchCompany]);

  if (loadingEmployer || (companyId && loadingCompany)) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        Loading...
      </div>
    );
  }
  if (errorEmployer) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 text-red-600">
        Failed to load employer profile.
      </div>
    );
  }
  if (companyId && errorCompany) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 text-red-600">
        Failed to load company profile.
      </div>
    );
  }
  if (!company) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        No company profile found.
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <CompanyProfileBasicInfo
          name={company.name}
          logoUrl={company.logoUrl || undefined}
          websiteUrl={company.websiteUrl || ''}
          scale={company.sizeRange || ''}
          industry={company.industry || ''}
        />
        <Separator className="my-0" />
        <CompanyProfileAbout description={company.description || ''} />
      </div>
    </div>
  );
}
