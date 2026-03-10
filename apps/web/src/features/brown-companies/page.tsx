import Header from '@/components/landing/Header';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import RecommendedCompaniesSection from '@/components/brown-companies/RecommendedCompaniesSection';
import CompaniesCategorySection from '@/components/brown-companies/CompaniesCategorySection';
import Footer from '@/components/landing/Footer';

export default function BrownCompaniesPage() {
  return (
    <div className="w-full bg-white">
      <Header />
      <FindJobsHeroSection />
      <RecommendedCompaniesSection />
      <CompaniesCategorySection />
      <Footer />
    </div>
  );
}
