import HeroSection from '@/components/landing/HeroSection';
import CompaniesSection from '@/components/landing/CompaniesSection';
import CategoriesSection from '@/components/landing/CategoriesSection';
import FeaturedJobsSection from '@/components/landing/FeaturedJobsSection';
import LatestJobsSection from '@/components/landing/LatestJobsSection';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <CompaniesSection />
      <CategoriesSection />
      <FeaturedJobsSection />
      <LatestJobsSection />
    </>
  );
}
