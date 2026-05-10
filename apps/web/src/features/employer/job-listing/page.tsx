'use client';

import { useUser } from '@/hooks/useUser';
import JobListingTable from '@/components/employer/jobListingTable';
import { Loader2, AlertCircle } from 'lucide-react';

export default function EmployerJobListingPage() {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">
              You must be logged in to view your job listings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="heading-h4-semi-bold mb-6">Job Listings</h1>
      <JobListingTable userId={user.id} />
    </div>
  );
}
