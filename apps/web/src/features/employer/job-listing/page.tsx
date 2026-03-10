'use client';

import JobListingTable from '@/components/employer/jobListingTable';

export default function EmployerJobListingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
      <JobListingTable />
    </div>
  );
}
