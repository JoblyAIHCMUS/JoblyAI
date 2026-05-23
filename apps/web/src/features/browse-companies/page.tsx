'use client';

import { useEffect } from 'react';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import RecommendedCompaniesSection from '@/components/browse-companies/RecommendedCompaniesSection';
import { usePageTitle } from '@/contexts/page-title-context';

export default function BrowseCompaniesPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Browse Companies');
  }, [setTitle]);

  return (
    <>
      <FindJobsHeroSection />
      <RecommendedCompaniesSection />
    </>
  );
}
