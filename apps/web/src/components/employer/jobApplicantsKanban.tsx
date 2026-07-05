'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import HiringStageChangeConfirm from '@/components/employer/hiringStageChangeConfirm';
import { MatchExplanationButton } from '@/components/employer/matchExplanationButton';
import {
  KanbanBoard,
  KanbanBoardProvider,
  KanbanBoardColumn,
  KanbanBoardColumnHeader,
  KanbanBoardColumnTitle,
  KanbanBoardColumnList,
  KanbanBoardColumnListItem,
  KanbanBoardCard,
  KanbanBoardCardTitle,
  KanbanColorCircle,
  KanbanBoardColumnIconButton,
  type KanbanBoardCircleColor,
} from '@/components/ui/kanban';

import { type Applicant } from '@/features/employer/job-listing/detail/data';
import { type HiringStage } from '@/features/employer/hiringStage';

const HIRING_STAGE_COLUMNS: {
  stage: HiringStage;
  circleColor: KanbanBoardCircleColor;
  borderColor: string;
}[] = [
  {
    stage: 'Applied',
    circleColor: 'blue',
    borderColor: 'border-t-blue-500',
  },
  {
    stage: 'Interview',
    circleColor: 'yellow',
    borderColor: 'border-t-amber-500',
  },
  {
    stage: 'Offer',
    circleColor: 'green',
    borderColor: 'border-t-green-500',
  },
  {
    stage: 'Rejected',
    circleColor: 'red',
    borderColor: 'border-t-red-500',
  },
  {
    stage: 'Withdrawn',
    circleColor: 'gray',
    borderColor: 'border-t-gray-500',
  },
];

interface JobApplicantsKanbanProps {
  applicants: Applicant[];
  onStageChange: (
    id: string,
    stage: HiringStage,
    targetId?: string,
    position?: 'before' | 'after'
  ) => Promise<void> | void;
}

export default function JobApplicantsKanban({
  applicants,
  onStageChange,
}: JobApplicantsKanbanProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    applicantId: string | null;
    targetStage: HiringStage | null;
    currentStage?: HiringStage;
  }>({
    show: false,
    applicantId: null,
    targetStage: null,
  });

  const groupedApplicants = useMemo(() => {
    const byStage = applicants.reduce<Record<string, Applicant[]>>(
      (acc, applicant) => {
        (acc[applicant.hiringStage] ??= []).push(applicant);
        return acc;
      },
      {}
    );
    return HIRING_STAGE_COLUMNS.map((col) => ({
      ...col,
      applicants: byStage[col.stage] ?? [],
    }));
  }, [applicants]);

  const handleDropOnColumn = (stage: HiringStage) => async (data: string) => {
    const parsed = JSON.parse(data) as { id: string };
    const applicant = applicants.find((a) => a.id === parsed.id);

    // If dropping on the same stage, no confirmation needed
    if (applicant?.hiringStage === stage) {
      return;
    }

    // Show confirmation dialog for stage changes
    setConfirmDialog({
      show: true,
      applicantId: parsed.id,
      targetStage: stage,
      currentStage: applicant?.hiringStage,
    });
  };

  const handleConfirmStageChange = async () => {
    if (!confirmDialog.applicantId || !confirmDialog.targetStage) return;

    setLoadingId(confirmDialog.applicantId);
    try {
      await onStageChange(confirmDialog.applicantId, confirmDialog.targetStage);
    } finally {
      setLoadingId(null);
      setConfirmDialog({
        show: false,
        applicantId: null,
        targetStage: null,
      });
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog({
      show: false,
      applicantId: null,
      targetStage: null,
    });
  };

  return (
    <KanbanBoardProvider>
      <KanbanBoard>
        {groupedApplicants.map((col) => (
          <KanbanBoardColumn
            key={col.stage}
            columnId={col.stage}
            className={`border-t-4 ${col.borderColor}`}
            onDropOverColumn={handleDropOnColumn(col.stage)}
          >
            <KanbanBoardColumnHeader>
              <KanbanBoardColumnTitle columnId={col.stage}>
                <KanbanColorCircle color={col.circleColor} />
                {col.stage}
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-full px-2 text-xs"
                >
                  {col.applicants.length}
                </Badge>
              </KanbanBoardColumnTitle>
              <KanbanBoardColumnIconButton>
                <MoreHorizontal className="h-4 w-4" />
              </KanbanBoardColumnIconButton>
            </KanbanBoardColumnHeader>

            <KanbanBoardColumnList>
              {col.applicants.map((applicant) => (
                <KanbanBoardColumnListItem
                  key={applicant.id}
                  cardId={applicant.id}
                >
                  <KanbanBoardCard
                    data={{ id: applicant.id }}
                    className={
                      loadingId === applicant.id
                        ? 'opacity-50 draggable={false}'
                        : ''
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={applicant.image}
                          alt={applicant.name}
                        />
                        <AvatarFallback>
                          {applicant.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <KanbanBoardCardTitle className="truncate">
                          {applicant.name}
                        </KanbanBoardCardTitle>
                        <Link
                          href={`/employer/all-applications/${applicant.id}`}
                          className="text-xs text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          draggable={false}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        <div className="body-body-1-medium">Applied on</div>
                        <div>{formatDate(applicant.appliedDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="body-body-1-medium">Score</div>
                        <div className="flex items-center gap-1">
                          {applicant.score == null ? (
                            <span className="text-[10px] text-amber-600 animate-pulse font-bold">
                              Calculating...
                            </span>
                          ) : (
                            <Star className="h-3 w-3 fill-current" />
                          )}
                          {applicant.score != null && (
                            <span className="font-bold">
                              {applicant.score.toFixed(2)}%
                            </span>
                          )}
                          <MatchExplanationButton
                            applicationId={applicant.id}
                            score={applicant.score}
                          />
                        </div>
                      </div>
                    </div>
                  </KanbanBoardCard>
                </KanbanBoardColumnListItem>
              ))}
            </KanbanBoardColumnList>
          </KanbanBoardColumn>
        ))}
      </KanbanBoard>
      {confirmDialog.show && confirmDialog.targetStage && (
        <HiringStageChangeConfirm
          actionType="advance"
          currentStage={confirmDialog.currentStage}
          nextStage={confirmDialog.targetStage}
          onCancel={handleCancelDialog}
          onConfirm={handleConfirmStageChange}
          loading={loadingId === confirmDialog.applicantId}
        />
      )}
    </KanbanBoardProvider>
  );
}
