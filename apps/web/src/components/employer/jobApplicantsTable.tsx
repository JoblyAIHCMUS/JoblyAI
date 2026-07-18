'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  ChevronRight,
  XCircle,
  MessageCircle,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { usePrefetchEmployerApplication } from '@/api-hook/application';
import HiringStageChangeConfirm from '@/components/employer/hiringStageChangeConfirm';
import { MatchExplanationButton } from '@/components/employer/matchExplanationButton';

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
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        {column.getIsSorted() === 'asc' && (
          <ChevronUp className="ml-2 h-4 w-4" />
        )}
        {column.getIsSorted() === 'desc' && (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue<string>('name');
      const b = rowB.getValue<string>('name');
      return a.localeCompare(b);
    },
    cell: ({ row }) => {
      const prefetch = usePrefetchEmployerApplication(row.original.id);
      return (
        <Link
          href={`/employer/all-applications/${row.original.id}`}
          onMouseEnter={prefetch}
          onFocus={prefetch}
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
      );
    },
  },
  {
    accessorKey: 'appliedDate',
    meta: { className: 'text-center px-0 sm:px-2' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Applied Date
        {column.getIsSorted() === 'asc' && (
          <ChevronUp className="ml-2 h-4 w-4" />
        )}
        {column.getIsSorted() === 'desc' && (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue<string>('appliedDate')),
  },
  {
    accessorKey: 'score',
    meta: { className: 'text-center px-0 sm:px-2' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Score
        {column.getIsSorted() === 'asc' && (
          <ChevronUp className="ml-2 h-4 w-4" />
        )}
        {column.getIsSorted() === 'desc' && (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const score = row.getValue<number>('score');
      const applicant = row.original;

      return (
        <div className="flex items-center justify-center gap-1">
          {score === null || score === undefined ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              AI Calculating...
            </span>
          ) : (
            <span
              className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold ${
                score >= 80
                  ? 'bg-green-100 text-green-700'
                  : score >= 50
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {score.toFixed(2)}%
            </span>
          )}
          <MatchExplanationButton applicationId={applicant.id} score={score} />
        </div>
      );
    },
  },
  {
    accessorKey: 'hiringStage',
    meta: { className: 'text-center px-0 sm:px-2' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Hiring Stage
        {column.getIsSorted() === 'asc' && (
          <ChevronUp className="ml-2 h-4 w-4" />
        )}
        {column.getIsSorted() === 'desc' && (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
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
    meta: { className: 'text-center px-0 sm:px-2' },
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
              disabled={isLoading || applicant.hiringStage === 'Withdrawn'}
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
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    actionType: 'advance' | 'reject' | null;
    applicantId: string | null;
    currentStage?: HiringStage;
    nextStage?: HiringStage;
  }>({
    show: false,
    actionType: null,
    applicantId: null,
  });

  const handleAdvance = async (id: string) => {
    const applicant = applicants.find((a) => a.id === id);
    if (!applicant) return;

    const nextStage = nextStageMap[applicant.hiringStage];
    setConfirmDialog({
      show: true,
      actionType: 'advance',
      applicantId: id,
      currentStage: applicant.hiringStage,
      nextStage,
    });
  };

  const handleDecline = async (id: string) => {
    setConfirmDialog({
      show: true,
      actionType: 'reject',
      applicantId: id,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.applicantId) return;

    setLoadingId(confirmDialog.applicantId);
    try {
      if (confirmDialog.actionType === 'advance') {
        await advanceApplicant(confirmDialog.applicantId);
      } else if (confirmDialog.actionType === 'reject') {
        await declineApplicant(confirmDialog.applicantId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed';
      toast.error(message);
    } finally {
      setLoadingId(null);
      setConfirmDialog({
        show: false,
        actionType: null,
        applicantId: null,
      });
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog({
      show: false,
      actionType: null,
      applicantId: null,
    });
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
    <>
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
      {confirmDialog.show && (
        <HiringStageChangeConfirm
          actionType={confirmDialog.actionType as 'advance' | 'reject'}
          currentStage={confirmDialog.currentStage}
          nextStage={confirmDialog.nextStage}
          onCancel={handleCancelDialog}
          onConfirm={handleConfirmAction}
          loading={loadingId === confirmDialog.applicantId}
        />
      )}
    </>
  );
}
