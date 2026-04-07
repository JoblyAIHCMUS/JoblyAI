'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { type ApplicationRecord } from '@/api-client/application';
import { mapApplicationStatusToHiringStage } from '@/api-client/application/mappers';
import { type Category } from '@/features/employer/job-listing/detail/data';
import { hiringStageStyles } from '@/features/employer/hiringStage';
import { type EmploymentType } from '@/features/employer/job-listing/data';

const hiringStageProgress: Record<string, number> = {
  Applied: 25,
  Interview: 50,
  Offer: 100,
  Rejected: 0,
  Withdrawn: 0,
};

const hiringStageColor: Record<string, string> = {
  Applied: 'bg-blue-500',
  Interview: 'bg-amber-500',
  Offer: 'bg-green-500',
  Rejected: 'bg-red-500',
  Withdrawn: 'bg-gray-500',
};

const categoryLabels: Record<Category, string> = {
  design: 'Design',
  marketing: 'Marketing',
  business: 'Business',
  technology: 'Technology',
  sales: 'Sales',
  finance: 'Finance',
  'human-resources': 'Human Resources',
  operations: 'Operations',
  other: 'Other',
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

interface ApplicantOverviewProps {
  applicant: ApplicationRecord;
}

export default function ApplicantOverview({
  applicant,
}: ApplicantOverviewProps) {
  const hiringStage = mapApplicationStatusToHiringStage(applicant.status);
  const progress = hiringStageProgress[hiringStage];
  const progressColor = hiringStageColor[hiringStage];

  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center pb-4">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              applicant.candidateId
            )}`}
            alt={applicant.candidate?.name || 'Candidate'}
          />
          <AvatarFallback>
            {(applicant.candidate?.name || 'C')
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <h2 className="heading-h5-semi-bold">
          {applicant.candidate?.name ||
            applicant.candidate?.email ||
            'Unknown Candidate'}
        </h2>
        <p className="label-label-2-regular text-muted-foreground">
          {applicant.job.title}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <Link href={`/employer/job-listing/${applicant.jobId}`}>
          <div className="rounded-lg bg-indigo-50 p-4 space-y-1 hover:bg-indigo-100 transition-colors">
            <p className="label-label-2-medium text-muted-foreground">
              Applied Role
            </p>
            <Separator />
            <p className="label-label-2-semi-bold">{applicant.job.title}</p>
            <p className="label-label-2-regular text-muted-foreground">
              {categoryLabels[applicant.job.category.slug as Category]} &bull;{' '}
              {employmentTypeLabels[applicant.job.type as EmploymentType]}
            </p>
          </div>
        </Link>

        <div className="space-y-1">
          <p className="label-label-2-medium text-muted-foreground">
            Applied Date
          </p>
          <p className="label-label-2-regular">
            {formatDate(applicant.createdAt.split('T')[0])}
          </p>
        </div>

        <div className="space-y-1">
          <p className="label-label-2-medium text-muted-foreground">Score</p>
          <p className="label-label-2-semi-bold">
            {(applicant.matchPercentage ?? 0).toFixed(1)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="label-label-2-medium text-muted-foreground">
              Hiring Stage
            </p>
            <Badge variant="outline" className={hiringStageStyles[hiringStage]}>
              {hiringStage}
            </Badge>
          </div>
          <Progress
            value={progress}
            className="h-2 [&>div]:transition-all"
            indicatorClassName={progressColor}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="label-label-2-medium text-muted-foreground">Contact</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{applicant.candidate?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        <Button className="w-full" asChild>
          <Link href="/employer/messages">
            <Mail className="mr-2 h-4 w-4" />
            Message
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
