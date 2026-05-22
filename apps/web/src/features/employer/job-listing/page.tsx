'use client';

import { useUser } from '@/hooks/useUser';
import JobListingTable from '@/components/employer/jobListingTable';
import { Loader2, AlertCircle } from 'lucide-react';

export default function EmployerJobListingPage() {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-3 sm:p-4 md:p-5">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-700">
              You must be logged in to view your job listings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <h1 className="heading-h4-semi-bold mb-4 sm:mb-6 md:mb-8 text-2xl sm:text-3xl md:text-4xl">
        Job Listings
      </h1>
      <JobListingTable userId={user.id} />
    </div>
  );
}
