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
import {
  type ApplicantDetail,
  hiringStageProgress,
  hiringStageColor,
} from '@/features/employer/all-applications/detail/data';
import { hiringStageStyles } from '@/features/employer/hiringStage';
import { type EmploymentType } from '@/features/employer/job-listing/data';

const categoryLabels: Record<string, string> = {
  design: 'Design',
  marketing: 'Marketing',
  business: 'Business',
  technology: 'Technology',
  sales: 'Sales',
  finance: 'Finance',
  'human-resources': 'Human Resources',
  operations: 'Operations',
};

// Helper to get category label, with fallback to title-cased slug
const getCategoryLabel = (slug: string): string => {
  if (categoryLabels[slug]) {
    return categoryLabels[slug];
  }
  // Fallback: convert slug to title case (e.g., "product-management" -> "Product Management")
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
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
    <Card className="w-full">
      <CardHeader className="items-center text-center pb-4">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage src={applicant.image} alt={applicant.name} />
          <AvatarFallback>
            {applicant.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <h2 className="heading-h5-semi-bold">{applicant.name}</h2>
        <p className="label-label-2-regular text-muted-foreground">
          {applicant.title}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <Link href={`/employer/job-listing/${applicant.jobListingId}`}>
          <div className="rounded-lg bg-indigo-50 p-4 space-y-1 hover:bg-indigo-100 transition-colors">
            <p className="label-label-2-medium text-muted-foreground">
              Applied Role
            </p>
            <Separator />
            <p className="label-label-2-semi-bold">{applicant.appliedRole}</p>
            <p className="label-label-2-regular text-muted-foreground">
              {getCategoryLabel(applicant.jobCategory)} &bull;{' '}
              {employmentTypeLabels[applicant.employmentType]}
            </p>
          </div>
        </Link>

        <div className="space-y-1">
          <p className="label-label-2-medium text-muted-foreground">
            Applied Date
          </p>
          <p className="label-label-2-regular">
            {formatDate(applicant.appliedDate)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="label-label-2-medium text-muted-foreground">Score</p>
          <p className="label-label-2-semi-bold">
            {applicant.score.toFixed(1)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="label-label-2-medium text-muted-foreground">
              Hiring Stage
            </p>
            <Badge
              variant="outline"
              className={hiringStageStyles[applicant.hiringStage]}
            >
              {applicant.hiringStage}
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
              <p className="text-sm">{applicant.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{applicant.phone}</p>
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
