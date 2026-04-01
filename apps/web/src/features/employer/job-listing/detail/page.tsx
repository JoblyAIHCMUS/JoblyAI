'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobDetail } from '@/api-hook/jobs/useJobDetail';
import { mapJobPostingToListingDetail } from '@/api-client/jobs/mappers';
import JobApplicantsView from '@/components/employer/jobApplicantsView';
import JobDetailsReview from '@/components/employer/jobDetailsReview';
import JobStatsPanel from '@/components/employer/jobStatsPanel';

export default function JobListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchJobDetail, loading, error, data: backendJob } = useJobDetail();

  // Fetch job details on mount
  useEffect(() => {
    if (id) {
      const jobId = parseInt(id, 10);
      if (!isNaN(jobId)) {
        fetchJobDetail(jobId).catch((err) => {
          console.error('Failed to fetch job details:', err);
        });
      }
    }
  }, [id, fetchJobDetail]);

  // Map backend data to frontend format
  const job = backendJob ? mapJobPostingToListingDetail(backendJob) : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4">
          <ArrowLeft className="h-7 w-7 animate-pulse" />
          <div className="h-9 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="mt-8">
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Job</h1>
          <p className="text-gray-600 mt-2">
            {error instanceof Error
              ? error.message
              : 'Failed to load job details'}
          </p>
        </div>
      </div>
    );
  }

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
        <Button variant="outline" size="icon" className="ml-2" asChild>
          <Link href={`/employer/job-listing/${id}/edit`} aria-label="Edit job">
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
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
