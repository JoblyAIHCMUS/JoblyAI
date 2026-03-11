'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jobListingDetails } from './data';
import JobApplicantsView from '@/components/employer/jobApplicantsView';
import JobDetailsReview from '@/components/employer/jobDetailsReview';
import JobStatsPanel from '@/components/employer/jobStatsPanel';

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

      <Tabs defaultValue="applicants" className="mt-8">
        <TabsList>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="job-details">Job Details</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="mt-6">
          <JobApplicantsView applicants={job.applicants} />
        </TabsContent>

        <TabsContent value="job-details" className="mt-6">
          <JobDetailsReview job={job} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <JobStatsPanel job={job} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
