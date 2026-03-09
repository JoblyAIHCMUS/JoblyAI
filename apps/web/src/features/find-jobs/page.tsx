import Header from '@/components/landing/Header';
import FindJobsHeroSection from '@/components/find-jobs/FindJobsHeroSection';
import JobListSection from '@/components/find-jobs/JobListSection';

export default function FindJobsPage() {
  return (
    <div className="w-full bg-white">
      <Header />
      <FindJobsHeroSection />
      <JobListSection />
    </div>
  );
}