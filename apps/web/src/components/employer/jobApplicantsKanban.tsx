'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
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
  type KanbanBoardDropDirection,
} from '@/components/ui/kanban';

import { type Applicant } from '@/features/employer/job-listing/detail/data';
import { type HiringStage } from '@/features/employer/hiringStage';

const HIRING_STAGE_COLUMNS: {
  stage: HiringStage;
  circleColor: KanbanBoardCircleColor;
  borderColor: string;
}[] = [
  {
    stage: 'In Review',
    circleColor: 'blue',
    borderColor: 'border-t-blue-500',
  },
  {
    stage: 'Shortlisted',
    circleColor: 'yellow',
    borderColor: 'border-t-amber-500',
  },
  {
    stage: 'Interviewed',
    circleColor: 'purple',
    borderColor: 'border-t-purple-500',
  },
  {
    stage: 'Hired',
    circleColor: 'green',
    borderColor: 'border-t-green-500',
  },
  {
    stage: 'Declined',
    circleColor: 'red',
    borderColor: 'border-t-red-500',
  },
];

interface JobApplicantsKanbanProps {
  applicants: Applicant[];
  onStageChange: (
    id: string,
    stage: HiringStage,
    targetId?: string,
    position?: 'before' | 'after'
  ) => void;
}

export default function JobApplicantsKanban({
  applicants,
  onStageChange,
}: JobApplicantsKanbanProps) {
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

  const handleDropOnColumn = (stage: HiringStage) => (data: string) => {
    const parsed = JSON.parse(data) as { id: string };
    onStageChange(parsed.id, stage);
  };

  const handleDropOnListItem =
    (stage: HiringStage, targetCardId: string) =>
    (data: string, dropDirection: KanbanBoardDropDirection) => {
      const parsed = JSON.parse(data) as { id: string };
      const position = dropDirection === 'top' ? 'before' : 'after';
      onStageChange(parsed.id, stage, targetCardId, position);
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
                  onDropOverListItem={handleDropOnListItem(
                    col.stage,
                    applicant.id
                  )}
                >
                  <KanbanBoardCard data={{ id: applicant.id }}>
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
                        <div className="font-medium">Applied on</div>
                        <div>{formatDate(applicant.appliedDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Score</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {applicant.score.toFixed(1)}
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
    </KanbanBoardProvider>
  );
}
