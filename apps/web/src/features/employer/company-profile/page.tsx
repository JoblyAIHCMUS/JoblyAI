'use client';

import { CompanyProfileBasicInfo } from '@/components/employer/companyProfileBasicInfo';
import { mockCompanyProfile } from './data';
import { Separator } from '@/components/ui/separator';
import { CompanyProfileAbout } from '@/components/employer/companyProfileAbout';

export default function EmployerCompanyProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CompanyProfileBasicInfo {...mockCompanyProfile} />
      <Separator className="my-8" />
      <CompanyProfileAbout description={mockCompanyProfile.description} />
    </div>
  );
}
