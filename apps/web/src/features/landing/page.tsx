import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import CompaniesSection from '@/components/landing/CompaniesSection';
import CategoriesSection from '@/components/landing/CategoriesSection';
import FeaturedJobsSection from '@/components/landing/FeaturedJobsSection';
import LatestJobsSection from '@/components/landing/LatestJobsSection';
import Footer from '@/components/landing/Footer';
export default function LandingPage() {
  return (
    <div className="w-full bg-white">
      <Header />
      <HeroSection />
      <CompaniesSection />
      <CategoriesSection />
      <FeaturedJobsSection />
      <LatestJobsSection />
      <Footer />
    </div>
  );
}
