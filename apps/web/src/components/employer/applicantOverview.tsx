'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { useMessageCandidate } from '@/hooks/useMessageCandidate';
import {
  type ApplicantDetail,
  hiringStageProgress,
  hiringStageColor,
} from '@/features/employer/all-applications/detail/data';
import { hiringStageStyles } from '@/features/employer/hiringStage';
import { type EmploymentType } from '@/features/employer/job-listing/data';

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  OTHER: 'Other',
};

interface ApplicantOverviewProps {
  applicant: ApplicantDetail;
}

export default function ApplicantOverview({
  applicant,
}: ApplicantOverviewProps) {
  const progress = hiringStageProgress[applicant.hiringStage];
  const progressColor = hiringStageColor[applicant.hiringStage];

  return (
    <Card className="w-full md:sticky md:top-[88px] lg:top-20">
      <CardHeader className="items-center text-center pb-3 sm:pb-4 px-3 sm:px-4 pt-4 sm:pt-6">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mb-2 sm:mb-3 flex-shrink-0">
          <AvatarImage src={applicant.image} alt={applicant.name} />
          <AvatarFallback>
            {applicant.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <h2 className="heading-h6-semi-bold sm:heading-h5-semi-bold line-clamp-2">
          {applicant.name}
        </h2>
        <p className="label-label-2-regular text-muted-foreground text-xs sm:text-sm line-clamp-1">
          {applicant.title}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-5 px-3 sm:px-4 pb-4 sm:pb-6">
        <Link href={`/employer/job-listing/${applicant.jobListingId}`}>
          <div className="rounded-lg bg-indigo-50 p-3 sm:p-4 space-y-1 hover:bg-indigo-100 transition-colors">
            <p className="label-label-2-medium text-muted-foreground text-xs sm:text-sm">
              Applied Role
            </p>
            <Separator className="my-1.5" />
            <p className="label-label-2-semi-bold text-xs sm:text-sm line-clamp-2">
              {applicant.appliedRole}
            </p>
            <p className="label-label-2-regular text-muted-foreground text-xs sm:text-sm">
              {applicant.jobCategory.name} &bull;{' '}
              {employmentTypeLabels[applicant.employmentType]}
            </p>
          </div>
        </Link>

        <div className="space-y-1">
          <p className="label-label-2-medium text-muted-foreground text-xs sm:text-sm">
            Applied Date
          </p>
          <p className="label-label-2-regular text-xs sm:text-sm">
            {formatDate(applicant.appliedDate)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="label-label-2-medium text-muted-foreground text-xs sm:text-sm">
            Score
          </p>
          <p className="label-label-2-semi-bold text-xs sm:text-sm">
            {applicant.score.toFixed(1)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="label-label-2-medium text-muted-foreground text-xs sm:text-sm">
              Hiring Stage
            </p>
            <Badge
              variant="outline"
              className={`${
                hiringStageStyles[applicant.hiringStage]
              } text-xs sm:text-sm py-1 px-2`}
            >
              {applicant.hiringStage}
            </Badge>
          </div>
          <Progress
            value={progress}
            className="h-1.5 sm:h-2 [&>div]:transition-all"
            indicatorClassName={progressColor}
          />
        </div>

        <Separator className="my-3 sm:my-4" />

        <div className="space-y-2">
          <p className="label-label-2-medium text-muted-foreground text-xs sm:text-sm">
            Contact
          </p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs sm:text-sm truncate">{applicant.email}</p>
            </div>
            {applicant.phone && (
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-xs sm:text-sm truncate">{applicant.phone}</p>
              </div>
            )}
          </div>
        </div>

        <MessageButton applicantId={applicant.applicantId} />
      </CardContent>
    </Card>
  );
}

function MessageButton({ applicantId }: { applicantId: string }) {
  const { handleMessageCandidate, isLoading } = useMessageCandidate();
  return (
    <Button
      className="w-full text-xs sm:text-sm h-9 sm:h-10"
      onClick={() => void handleMessageCandidate(applicantId)}
      disabled={isLoading}
    >
      <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
      {isLoading ? 'Opening…' : 'Message'}
    </Button>
  );
}
