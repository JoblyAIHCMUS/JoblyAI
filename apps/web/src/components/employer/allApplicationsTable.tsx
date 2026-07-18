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

import { type AllApplication } from '@/features/employer/all-applications/data';
import {
  type HiringStage,
  hiringStageStyles,
  nextStageMap,
  hiringStageOrder,
} from '@/features/employer/hiringStage';

export { nextStageMap };

export const columns: ColumnDef<AllApplication>[] = [
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
    accessorKey: 'appliedRole',
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Applied Role
        {column.getIsSorted() === 'asc' && (
          <ChevronUp className="ml-2 h-4 w-4" />
        )}
        {column.getIsSorted() === 'desc' && (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => row.getValue<string>('appliedRole'),
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
    meta: { className: 'text-center' },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Match
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
      if (score === null || score === undefined) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            AI Calculating...
          </span>
        );
      }

      const badgeClass =
        score >= 80
          ? 'bg-green-100 text-green-700'
          : score >= 50
          ? 'bg-blue-100 text-blue-700'
          : 'bg-slate-100 text-slate-700';

      return (
        <span
          className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
        >
          {score.toFixed(2)}%
        </span>
      );
    },
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
    meta: { className: 'text-center' },
    cell: ({ row, table }) => {
      const application = row.original;
      const nextStage = nextStageMap[application.hiringStage];
      const meta = table.options.meta as {
        advanceApplicant?: (id: string) => Promise<void>;
        declineApplicant?: (id: string) => Promise<void>;
        messageCandidate?: (id: string) => Promise<void>;
        loadingId?: string | null;
      };
      const isLoading = meta?.loadingId === application.id;

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
              <Link href={`/employer/all-applications/${application.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => meta.messageCandidate?.(application.applicantId)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Message Candidate
            </DropdownMenuItem>
            {nextStage && (
              <DropdownMenuItem
                disabled={isLoading}
                onClick={() => meta.advanceApplicant?.(application.id)}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                Advance to {nextStage}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              disabled={isLoading || application.hiringStage === 'Rejected' || application.hiringStage === 'Withdrawn' || application.hiringStage === 'Offered'}
              onClick={() => meta.declineApplicant?.(application.id)}
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

interface AllApplicationsTableProps {
  applications: AllApplication[];
  advanceApplicant: (id: string) => Promise<void> | void;
  declineApplicant: (id: string) => Promise<void> | void;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  total?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
}

export default function AllApplicationsTable({
  applications,
  advanceApplicant,
  declineApplicant,
  pageSize = 10,
  currentPage = 1,
  totalPages = 1,
  total = 0,
  loading = false,
  onPageChange,
}: AllApplicationsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { handleMessageCandidate: messageCandidate } = useMessageCandidate();
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    actionType: 'advance' | 'reject' | null;
    applicationId: string | null;
    currentStage?: HiringStage;
    nextStage?: HiringStage;
  }>({
    show: false,
    actionType: null,
    applicationId: null,
  });

  const handleAdvance = async (id: string) => {
    const application = applications.find((a) => a.id === id);
    if (!application) return;

    const nextStage = nextStageMap[application.hiringStage];
    setConfirmDialog({
      show: true,
      actionType: 'advance',
      applicationId: id,
      currentStage: application.hiringStage,
      nextStage,
    });
  };

  const handleDecline = async (id: string) => {
    setConfirmDialog({
      show: true,
      actionType: 'reject',
      applicationId: id,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.applicationId) return;

    setLoadingId(confirmDialog.applicationId);
    try {
      if (confirmDialog.actionType === 'advance') {
        await advanceApplicant(confirmDialog.applicationId);
      } else if (confirmDialog.actionType === 'reject') {
        await declineApplicant(confirmDialog.applicationId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed';
      toast.error(message);
    } finally {
      setLoadingId(null);
      setConfirmDialog({
        show: false,
        actionType: null,
        applicationId: null,
      });
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog({
      show: false,
      actionType: null,
      applicationId: null,
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <DataTable
          columns={columns}
          data={applications}
          pageSize={pageSize}
          meta={{
            advanceApplicant: handleAdvance,
            declineApplicant: handleDecline,
            messageCandidate: handleMessageCandidateClick,
            loadingId,
          }}
        />

        {/* Custom pagination controls for server-side pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6">
            <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, total)} of {total} results
            </div>
            <div className="flex gap-1 sm:gap-2 order-1 sm:order-2 flex-wrap justify-start sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              >
                Previous
              </Button>
              <Button
                key={currentPage}
                variant="default"
                size="sm"
                disabled={true}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              >
                {currentPage}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      {confirmDialog.show && (
        <HiringStageChangeConfirm
          actionType={confirmDialog.actionType as 'advance' | 'reject'}
          currentStage={confirmDialog.currentStage}
          nextStage={confirmDialog.nextStage}
          onCancel={handleCancelDialog}
          onConfirm={handleConfirmAction}
          loading={loadingId === confirmDialog.applicationId}
        />
      )}
    </>
  );
}
