'use client';

import { useState, useEffect, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Send,
  XCircle,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import ConfirmDelete from '@/components/ui/confirmDelete';
import { formatDate } from '@/lib/utils';
import { useEmployerJobs } from '@/api-hook/jobs/useEmployerJobs';
import { useEmployerCompanyJobs } from '@/api-hook/jobs/useEmployerCompanyJobs';
import { usePublishJob } from '@/api-hook/jobs/usePublishJob';
import { useCloseJob } from '@/api-hook/jobs/useCloseJob';
import { useUpdateJobStatus } from '@/api-hook/jobs/useUpdateJobStatus';
import { JobPosting, EmploymentType } from '@/api-client/jobs/types';
import type { JobStatus } from '@/types/job';
import { deleteJobPosting } from '@/api-client/jobs/employer';
import { getEmployerProfile } from '@/api-client/employer';

// Frontend representation of a job listing
interface JobListing {
  id: string;
  title: string;
  status: 'Draft' | 'Live' | 'Closed';
  datePosted: string;
  dateUpdated: string;
  employmentType: EmploymentType;
  applicants: number;
}

const statusStyles: Record<JobListing['status'], string> = {
  Draft: 'border-yellow-500 text-yellow-600 bg-transparent hover:bg-yellow-50',
  Live: 'border-green-500 text-green-600 bg-transparent hover:bg-green-50',
  Closed: 'border-red-500 text-red-600 bg-transparent hover:bg-red-50',
};

const employmentTypeStyles: Record<EmploymentType, string> = {
  FULL_TIME:
    'border-indigo-500 text-indigo-600 bg-transparent hover:bg-indigo-50',
  PART_TIME: 'border-teal-500 text-teal-600 bg-transparent hover:bg-teal-50',
  CONTRACT: 'border-amber-500 text-amber-600 bg-transparent hover:bg-amber-50',
  INTERNSHIP: 'border-sky-500 text-sky-600 bg-transparent hover:bg-sky-50',
  FREELANCE:
    'border-orange-500 text-orange-600 bg-transparent hover:bg-orange-50',
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

/**
 * Converts backend JobPosting to frontend JobListing format
 */
function mapJobPostingToListing(job: JobPosting): JobListing {
  // Map backend status to frontend status
  const statusMap: Record<string, JobListing['status']> = {
    OPEN: 'Live',
    DRAFT: 'Draft',
    CLOSED: 'Closed',
  };

  return {
    id: job.id.toString(),
    title: job.title,
    status: statusMap[job.status] || 'Draft',
    datePosted:
      job.createdAt instanceof Date
        ? job.createdAt.toISOString().split('T')[0]
        : new Date(job.createdAt).toISOString().split('T')[0],
    dateUpdated:
      job.updatedAt instanceof Date
        ? job.updatedAt.toISOString().split('T')[0]
        : new Date(job.updatedAt).toISOString().split('T')[0],
    employmentType: job.type,
    applicants: 0, // TODO: Add applicants field to backend or fetch separately
  };
}

export const columns: ColumnDef<JobListing>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'text-center' },
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/employer/job-listing/${row.original.id}`}
        className="body-body-1-medium hover:underline"
      >
        {row.getValue('title')}
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as JobListing['status'];
      return (
        <Badge variant="outline" className={statusStyles[status]}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'datePosted',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date Posted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue<string>('datePosted')),
  },
  {
    accessorKey: 'dateUpdated',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date Updated
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue<string>('dateUpdated')),
  },
  {
    accessorKey: 'employmentType',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Job Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue('employmentType') as EmploymentType;
      return (
        <Badge variant="outline" className={employmentTypeStyles[type]}>
          {employmentTypeLabels[type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'applicants',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Applicants
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-center body-body-1-medium">
        {row.getValue<number>('applicants').toLocaleString()}
      </span>
    ),
  },
  {
    id: 'actions',
    meta: { className: 'text-center' },
    cell: ({ row, table }) => {
      const job = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/employer/job-listing/${job.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/employer/job-listing/${job.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Job Posting
              </Link>
            </DropdownMenuItem>

            {/* Status Change Options */}
            <DropdownMenuSeparator />

            {/* From Draft: Can go to Live or Closed */}
            {job.status === 'Draft' && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    const meta = table.options.meta as {
                      updateJobStatus?: (id: string, status: JobStatus) => void;
                    };
                    meta.updateJobStatus?.(job.id, 'OPEN');
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish Job Posting
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const meta = table.options.meta as {
                      updateJobStatus?: (id: string, status: JobStatus) => void;
                    };
                    meta.updateJobStatus?.(job.id, 'CLOSED');
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark as Closed
                </DropdownMenuItem>
              </>
            )}

            {/* From Live: Can go to Draft or Closed */}
            {job.status === 'Live' && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    const meta = table.options.meta as {
                      updateJobStatus?: (id: string, status: JobStatus) => void;
                    };
                    meta.updateJobStatus?.(job.id, 'DRAFT');
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Revert to Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const meta = table.options.meta as {
                      updateJobStatus?: (id: string, status: JobStatus) => void;
                    };
                    meta.updateJobStatus?.(job.id, 'CLOSED');
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Close Job Posting
                </DropdownMenuItem>
              </>
            )}

            {/* From Closed: Can go to Draft or Live */}
            {job.status === 'Closed' && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    const meta = table.options.meta as {
                      updateJobStatus?: (id: string, status: JobStatus) => void;
                    };
                    meta.updateJobStatus?.(job.id, 'DRAFT');
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Revert to Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const meta = table.options.meta as {
                      updateJobStatus?: (id: string, status: JobStatus) => void;
                    };
                    meta.updateJobStatus?.(job.id, 'OPEN');
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Reopen Job Posting
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                const meta = table.options.meta as {
                  handleDeleteClick?: (id: string) => void;
                };
                meta.handleDeleteClick?.(job.id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface JobListingTableProps {
  userId: string;
  pageSize?: number;
}

export default function JobListingTable({
  userId,
  pageSize = 10,
}: JobListingTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayData, setDisplayData] = useState<JobListing[]>([]);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    jobId: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    jobId: null,
    isDeleting: false,
  });
  const [employerProfile, setEmployerProfile] = useState<{
    id: string;
    company?: { id: number; name: string } | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const {
    fetchEmployerJobs,
    loading: userJobsLoading,
    error: userJobsError,
    data: userJobsData,
    totalPages: userTotalPages,
    total: userTotal,
  } = useEmployerJobs({ initialPageSize: pageSize });

  const {
    fetchCompanyJobs,
    loading: companyJobsLoading,
    error: companyJobsError,
    data: companyJobsData,
    totalPages: companyTotalPages,
    total: companyTotal,
  } = useEmployerCompanyJobs({ initialPageSize: pageSize });

  const { publishJob: publishJobAPI } = usePublishJob();
  const { closeJob: closeJobAPI } = useCloseJob();
  const { updateStatus: updateJobStatusAPI } = useUpdateJobStatus();

  // Determine which hook to use based on company registration
  const useCompany = employerProfile?.company?.id;
  const loading = useCompany ? companyJobsLoading : userJobsLoading;
  const error = useCompany ? companyJobsError : userJobsError;
  const data = useCompany ? companyJobsData : userJobsData;
  const totalPages = useCompany ? companyTotalPages : userTotalPages;
  const total = useCompany ? companyTotal : userTotal;

  // Fetch employer profile to check company registration
  useEffect(() => {
    const loadEmployerProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await getEmployerProfile();
        setEmployerProfile({
          id: profile.id,
          company: profile.company,
        });
      } catch (err) {
        console.error('Failed to load employer profile:', err);
        // Set profile to null on error, will fall back to user-based jobs
        setEmployerProfile({ id: userId });
      } finally {
        setProfileLoading(false);
      }
    };

    loadEmployerProfile();
  }, [userId]);

  // Fetch jobs when component mounts or page changes
  useEffect(() => {
    if (profileLoading) return; // Wait for profile to load

    const loadJobs = async () => {
      try {
        if (useCompany && employerProfile?.company?.id) {
          // Use company-based fetch
          await fetchCompanyJobs(employerProfile.company.id, currentPage);
        } else {
          // Fall back to user-based fetch
          await fetchEmployerJobs(userId, currentPage);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    };

    loadJobs();
  }, [
    userId,
    currentPage,
    profileLoading,
    useCompany,
    employerProfile?.company?.id,
  ]);

  // Map fetched data to display format
  useEffect(() => {
    if (data && data.length > 0) {
      const mapped = data.map(mapJobPostingToListing);
      setDisplayData(mapped);
    } else {
      setDisplayData([]);
    }
  }, [data]);

  const publishJob = useCallback(
    async (id: string) => {
      try {
        const jobId = parseInt(id, 10);
        // Call the API to publish the job
        await publishJobAPI(jobId);
        // Refresh the page after publishing
        if (useCompany && employerProfile?.company?.id) {
          await fetchCompanyJobs(employerProfile.company.id, currentPage);
        } else {
          await fetchEmployerJobs(userId, currentPage);
        }
      } catch (err) {
        console.error('Failed to publish job:', err);
      }
    },
    [
      useCompany,
      employerProfile?.company?.id,
      currentPage,
      userId,
      publishJobAPI,
      fetchCompanyJobs,
      fetchEmployerJobs,
    ]
  );

  const closeJob = useCallback(
    async (id: string) => {
      try {
        const jobId = parseInt(id, 10);
        // Call the API to close the job
        await closeJobAPI(jobId);
        // Refresh the page after closing
        if (useCompany && employerProfile?.company?.id) {
          await fetchCompanyJobs(employerProfile.company.id, currentPage);
        } else {
          await fetchEmployerJobs(userId, currentPage);
        }
      } catch (err) {
        console.error('Failed to close job:', err);
      }
    },
    [
      useCompany,
      employerProfile?.company?.id,
      currentPage,
      userId,
      closeJobAPI,
      fetchCompanyJobs,
      fetchEmployerJobs,
    ]
  );

  const deleteJob = useCallback(
    async (id: string) => {
      try {
        await deleteJobPosting(parseInt(id, 10));
        // Refresh the page after deletion
        if (useCompany && employerProfile?.company?.id) {
          await fetchCompanyJobs(employerProfile.company.id, currentPage);
        } else {
          await fetchEmployerJobs(userId, currentPage);
        }
      } catch (err) {
        console.error('Failed to delete job:', err);
      }
    },
    [
      useCompany,
      employerProfile?.company?.id,
      currentPage,
      userId,
      fetchCompanyJobs,
      fetchEmployerJobs,
    ]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmState({
      isOpen: true,
      jobId: id,
      isDeleting: false,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmState.jobId) return;

    setDeleteConfirmState((prev) => ({ ...prev, isDeleting: true }));
    try {
      await deleteJob(deleteConfirmState.jobId);
      setDeleteConfirmState({
        isOpen: false,
        jobId: null,
        isDeleting: false,
      });
    } catch (err) {
      setDeleteConfirmState((prev) => ({ ...prev, isDeleting: false }));
      console.error('Failed to delete job:', err);
    }
  }, [deleteConfirmState.jobId, deleteJob]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmState({
      isOpen: false,
      jobId: null,
      isDeleting: false,
    });
  }, []);
  const updateJobStatus = useCallback(
    async (id: string, status: JobStatus) => {
      try {
        const jobId = parseInt(id, 10);
        // Call the API to update the job status
        await updateJobStatusAPI(jobId, status);
        // Refresh the page after status change
        if (useCompany && employerProfile?.company?.id) {
          await fetchCompanyJobs(employerProfile.company.id, currentPage);
        } else {
          await fetchEmployerJobs(userId, currentPage);
        }
      } catch (err) {
        console.error('Failed to update job status:', err);
      }
    },
    [
      useCompany,
      employerProfile?.company?.id,
      currentPage,
      userId,
      updateJobStatusAPI,
      fetchCompanyJobs,
      fetchEmployerJobs,
    ]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">
            Failed to load job listings. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading && displayData.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && displayData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No job listings found. Create your first job posting to get started.
          </p>
        </div>
      )}

      {displayData.length > 0 && (
        <>
          <DataTable
            columns={columns}
            data={displayData}
            pageSize={pageSize}
            meta={{ publishJob, closeJob, handleDeleteClick, updateJobStatus }}
          />

          {/* Custom pagination controls for server-side pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, total)} of {total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 2), currentPage + 1)
                  .map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {deleteConfirmState.isOpen && (
        <ConfirmDelete
          title="Delete Job Posting"
          description="Are you sure you want to delete this job posting? This action cannot be undone."
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={deleteConfirmState.isDeleting}
        />
      )}
    </div>
  );
}
