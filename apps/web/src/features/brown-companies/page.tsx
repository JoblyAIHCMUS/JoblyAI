import Header from '@/components/landing/Header';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import RecommendedCompaniesSection from '@/components/landing/RecommendedCompaniesSection';

export default function BrownCompaniesPage() {
  return (
    <div className="w-full bg-white">
      <Header />
      <FindJobsHeroSection />
      <RecommendedCompaniesSection />
    </div>
  );
}
