'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import ApplicantOverview from '@/components/employer/applicantOverview';
import ApplicantDetails from '@/components/employer/applicantDetails';
import { useEmployerApplicationDetail } from '@/api-hook/application';

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    fetchApplicationById,
    loading,
    error,
    data: applicationData,
  } = useEmployerApplicationDetail();

  // Wrap fetch in useCallback to memoize it
  const handleFetch = useCallback(
    (applicationId: number) => {
      fetchApplicationById(applicationId).catch((err) => {
        console.error('Failed to fetch application:', err);
      });
    },
    [fetchApplicationById]
  );

  useEffect(() => {
    if (id) {
      const applicationId = parseInt(id, 10);
      if (!isNaN(applicationId)) {
        handleFetch(applicationId);
      }
    }
  }, [id]); // Only depend on id, not handleFetch

  const handleStatusChange = useCallback(() => {
    // Refresh application data to reflect status change
    if (id) {
      const applicationId = parseInt(id, 10);
      if (!isNaN(applicationId)) {
        handleFetch(applicationId);
      }
    }
  }, [id, handleFetch]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">
              Failed to load application details. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="heading-h3-bold">Applicant not found</h1>
      </div>
    );
  }

  const candidateName =
    applicationData.candidate?.name ||
    applicationData.candidate?.email ||
    'Unknown Candidate';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h1 className="text-3xl font-bold">{candidateName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <ApplicantOverview applicant={applicationData} />
        <ApplicantDetails
          applicant={applicationData}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
