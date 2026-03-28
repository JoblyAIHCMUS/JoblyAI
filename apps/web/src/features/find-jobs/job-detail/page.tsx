'use client';
import JobDetailHeader from '@/components/job-detail/JobDetailHeader';
import JobDetailContent from '@/components/job-detail/JobDetailContent';
import JobCompanySection from '@/components/job-detail/JobCompanySection';
import JobDetailSimilarJobs from '@/components/job-detail/JobDetailSimilarJobs';
import { useJobDetail } from '@/hooks/useJobDetail';

export default function JobDetailPage() {
  const {
    jobId,
    breadcrumbItems,
    jobName,
    companyName,
    address,
    workType,
    logoUrl,
    companyDescription,
    companyPhotos,
    companyPageUrl,
  } = useJobDetail();

  return (
    <div className="w-full bg-white">
      <JobDetailHeader
        breadcrumbItems={breadcrumbItems}
        jobTitle={jobName}
        companyName={companyName}
        address={address}
        workType={workType}
        logoUrl={logoUrl}
        jobId={jobId}
      />
      <JobDetailContent />
      <JobCompanySection
        companyName={companyName}
        logoUrl={logoUrl}
        description={companyDescription}
        photos={companyPhotos}
        companyUrl={companyPageUrl}
      />
      <JobDetailSimilarJobs />
    </div>
  );
}
