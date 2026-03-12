'use client';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  ChevronRight,
  XCircle,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

import { type Applicant } from '@/features/employer/job-listing/detail/data';
import {
  type HiringStage,
  hiringStageStyles,
  nextStageMap,
  hiringStageOrder,
} from '@/features/employer/hiringStage';

export { nextStageMap };

export const columns: ColumnDef<Applicant>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue<string>('name');
      const b = rowB.getValue<string>('name');
      return a.localeCompare(b);
    },
    cell: ({ row }) => (
      <Link
        href={`/employer/all-applications/${row.original.id}`}
        className="flex items-center gap-3 font-medium hover:underline"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={row.original.image}
            alt={row.getValue<string>('name')}
          />
          <AvatarFallback>
            {row
              .getValue<string>('name')
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'appliedDate',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Applied Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue<string>('appliedDate')),
  },
  {
    accessorKey: 'score',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue<number>('score').toFixed(1)}
      </span>
    ),
  },
  {
    accessorKey: 'hiringStage',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Hiring Stage
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue<HiringStage>('hiringStage');
      const b = rowB.getValue<HiringStage>('hiringStage');
      return hiringStageOrder[a] - hiringStageOrder[b];
    },
    cell: ({ row }) => {
      const stage = row.getValue('hiringStage') as HiringStage;
      return (
        <Badge variant="outline" className={hiringStageStyles[stage]}>
          {stage}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    meta: { className: 'text-center' },
    cell: ({ row, table }) => {
      const applicant = row.original;
      const nextStage = nextStageMap[applicant.hiringStage];

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
              <Link href={`/employer/all-applications/${applicant.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {nextStage && (
              <DropdownMenuItem
                onClick={() => {
                  const meta = table.options.meta as {
                    advanceApplicant?: (id: string) => void;
                  };
                  meta.advanceApplicant?.(applicant.id);
                }}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                Advance to {nextStage}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                const meta = table.options.meta as {
                  declineApplicant?: (id: string) => void;
                };
                meta.declineApplicant?.(applicant.id);
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface JobApplicantsTableProps {
  applicants: Applicant[];
  advanceApplicant: (id: string) => void;
  declineApplicant: (id: string) => void;
}

export default function JobApplicantsTable({
  applicants,
  advanceApplicant,
  declineApplicant,
}: JobApplicantsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={applicants}
      meta={{ advanceApplicant, declineApplicant }}
    />
  );
}
