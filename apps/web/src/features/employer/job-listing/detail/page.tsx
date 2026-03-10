'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { jobListingDetails } from './data';
import JobApplicantsView from '@/components/employer/jobApplicantsView';

export default function JobListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const job = jobListingDetails[id];

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Job not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h1 className="text-3xl font-bold">{job.title}</h1>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Applicants</h2>
        <JobApplicantsView applicants={job.applicants} />
      </section>
    </div>
  );
}
