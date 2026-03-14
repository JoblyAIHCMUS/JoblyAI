import Header from '@/components/landing/Header';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import RecommendedCompaniesSection from '@/components/browse-companies/RecommendedCompaniesSection';
import CompaniesCategorySection from '@/components/browse-companies/CompaniesCategorySection';
import Footer from '@/components/landing/Footer';

export default function BrowseCompaniesPage() {
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
