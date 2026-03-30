'use client';

import { useState, useEffect } from 'react';
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
import { formatDate } from '@/lib/utils';
import { useEmployerJobs } from '@/api-hook/jobs/useEmployerJobs';
import { JobPosting, EmploymentType } from '@/api-client/jobs/types';
import { deleteJobPosting } from '@/api-client/jobs/employer';

// Frontend representation of a job listing
interface JobListing {
  id: string;
  title: string;
  status: 'Draft' | 'Live' | 'Closed';
  datePosted: string;
  dateClosed: string | null;
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
    dateClosed: null, // Backend doesn't track close date
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
        className="font-medium hover:underline"
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
    accessorKey: 'dateClosed',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date Closed
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue<string | null>('dateClosed');
      return (
        <span className="text-muted-foreground">
          {value ? formatDate(value) : '\u2014'}
        </span>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue<string | null>(columnId);
      const b = rowB.getValue<string | null>(columnId);
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    },
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
      <span className="text-center font-medium">
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
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Listing
            </DropdownMenuItem>
            {job.status === 'Draft' && (
              <DropdownMenuItem
                onClick={() => {
                  const meta = table.options.meta as {
                    publishJob?: (id: string) => void;
                  };
                  meta.publishJob?.(job.id);
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Publish Job Listing
              </DropdownMenuItem>
            )}
            {job.status === 'Live' && (
              <DropdownMenuItem
                onClick={() => {
                  const meta = table.options.meta as {
                    closeJob?: (id: string) => void;
                  };
                  meta.closeJob?.(job.id);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Close Job Listing
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                const meta = table.options.meta as {
                  deleteJob?: (id: string) => void;
                };
                meta.deleteJob?.(job.id);
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

  const { fetchEmployerJobs, loading, error, data, totalPages, total } =
    useEmployerJobs({ initialPageSize: pageSize });

  // Fetch jobs when component mounts or page changes
  useEffect(() => {
    const loadJobs = async () => {
      try {
        await fetchEmployerJobs(userId, currentPage);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    };

    loadJobs();
  }, [userId, currentPage]);

  // Map fetched data to display format
  useEffect(() => {
    if (data && data.length > 0) {
      const mapped = data.map(mapJobPostingToListing);
      setDisplayData(mapped);
    } else {
      setDisplayData([]);
    }
  }, [data]);

  const publishJob = async (id: string) => {
    try {
      // Refresh the page after publishing
      await fetchEmployerJobs(userId, currentPage);
    } catch (err) {
      console.error('Failed to publish job:', err);
    }
  };

  const closeJob = async (id: string) => {
    try {
      // Refresh the page after closing
      await fetchEmployerJobs(userId, currentPage);
    } catch (err) {
      console.error('Failed to close job:', err);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await deleteJobPosting(parseInt(id, 10));
      // Refresh the page after deletion
      await fetchEmployerJobs(userId, currentPage);
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
            meta={{ publishJob, closeJob, deleteJob }}
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
    </div>
  );
}
