'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  ChevronRight,
  XCircle,
  MessageCircle,
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
import { useMessageCandidate } from '@/hooks/useMessageCandidate';

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
        className="flex items-center gap-3 body-body-1-medium hover:underline"
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
      <span className="body-body-1-medium">
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
      const meta = table.options.meta as {
        advanceApplicant?: (id: string) => Promise<void>;
        declineApplicant?: (id: string) => Promise<void>;
        messageCandidate?: (id: string) => Promise<void>;
        loadingId?: string | null;
      };
      const isLoading = meta?.loadingId === applicant.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isLoading}
            >
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
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => meta.messageCandidate?.(applicant.applicantId)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Message Candidate
            </DropdownMenuItem>
            {nextStage && (
              <DropdownMenuItem
                disabled={isLoading}
                onClick={() => meta.advanceApplicant?.(applicant.id)}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                Advance to {nextStage}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              disabled={isLoading}
              onClick={() => meta.declineApplicant?.(applicant.id)}
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
  advanceApplicant: (id: string) => Promise<void> | void;
  declineApplicant: (id: string) => Promise<void> | void;
}

export default function JobApplicantsTable({
  applicants,
  advanceApplicant,
  declineApplicant,
}: JobApplicantsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { handleMessageCandidate: messageCandidate } = useMessageCandidate();

  const handleAdvance = async (id: string) => {
    setLoadingId(id);
    try {
      await advanceApplicant(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to advance applicant';
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setLoadingId(id);
    try {
      await declineApplicant(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to decline applicant';
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMessageCandidateClick = async (applicantId: string) => {
    setLoadingId(applicantId);
    try {
      // applicantId is passed to the hook to identify which candidate to message
      await messageCandidate(applicantId);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <DataTable
      columns={columns}
      data={applicants}
      meta={{
        advanceApplicant: handleAdvance,
        declineApplicant: handleDecline,
        messageCandidate: handleMessageCandidateClick,
        loadingId,
      }}
    />
  );
}
