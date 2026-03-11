'use client';

import { useState } from 'react';
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

import {
  type JobListing,
  type JobListingStatus,
  type EmploymentType,
  jobListings,
} from '@/features/employer/job-listing/data';

const statusStyles: Record<JobListingStatus, string> = {
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
      const status = row.getValue('status') as JobListingStatus;
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

export default function JobListingTable() {
  const [data, setData] = useState<JobListing[]>(jobListings);

  const publishJob = (id: string) => {
    setData((prev) =>
      prev.map((job) =>
        job.id === id ? { ...job, status: 'Live' as const } : job
      )
    );
  };

  const closeJob = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setData((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, status: 'Closed' as const, dateClosed: today }
          : job
      )
    );
  };

  const deleteJob = (id: string) => {
    setData((prev) => prev.filter((job) => job.id !== id));
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      meta={{ publishJob, closeJob, deleteJob }}
    />
  );
}
