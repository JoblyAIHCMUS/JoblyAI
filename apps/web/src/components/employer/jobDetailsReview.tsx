import DOMPurify from 'dompurify';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  type JobListingDetail,
  type SalaryCurrency,
} from '@/features/employer/job-listing/detail/data';
import type { EmploymentType } from '@/features/employer/job-listing/data';
import { CATEGORY_COLORS } from '@/features/employer/job-listing/detail/constants';
import type { PreShortlistQuestionsForJobView } from '@/api-client/pre-shortlist';

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  OTHER: 'Other',
};

const CURRENCY_SYMBOLS: Record<Exclude<SalaryCurrency, 'none'>, string> = {
  usd: '$',
  eur: '€',
  gbp: '£',
  vnd: '₫',
  jpy: '¥',
  cny: '¥',
};

function formatSalary(
  currency: SalaryCurrency,
  min: string,
  max: string
): string {
  if (currency === 'none') return 'Not specified';
  const symbol = CURRENCY_SYMBOLS[currency];
  const minNum = Number(min);
  const maxNum = Number(max);
  const hasMin = !Number.isNaN(minNum);
  const hasMax = !Number.isNaN(maxNum);

  if (!hasMin && !hasMax) {
    return 'Not specified';
  }

  if (hasMin && hasMax) {
    const fmtMin = minNum.toLocaleString();
    const fmtMax = maxNum.toLocaleString();
    return `${symbol}${fmtMin} - ${symbol}${fmtMax} ${currency.toUpperCase()}`;
  }

  if (hasMin) {
    const fmtMin = minNum.toLocaleString();
    return `From ${symbol}${fmtMin} ${currency.toUpperCase()}`;
  }

  const fmtMax = maxNum.toLocaleString();
  return `Up to ${symbol}${fmtMax} ${currency.toUpperCase()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface JobDetailsReviewProps {
  job: JobListingDetail;
  preShortlistData?: PreShortlistQuestionsForJobView | null;
  preShortlistLoading?: boolean;
  preShortlistError?: Error | null;
}

export default function JobDetailsReview({
  job,
  preShortlistData,
  preShortlistLoading,
  preShortlistError,
}: JobDetailsReviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
      <div>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="pre-shortlist">
              Pre-Shortlist Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <div
              className="prose prose-slate max-w-none
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
                prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
                prose-li:my-1 prose-p:my-3 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(job.description, {
                  ALLOWED_TAGS: [
                    'h2',
                    'h3',
                    'p',
                    'br',
                    'hr',
                    'ul',
                    'ol',
                    'li',
                    'strong',
                    'b',
                    'em',
                    'i',
                    's',
                    'del',
                    'blockquote',
                    'code',
                    'pre',
                  ],
                  ALLOWED_ATTR: [],
                }),
              }}
            />
          </TabsContent>

          <TabsContent value="pre-shortlist">
            {preShortlistLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : preShortlistError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {preShortlistError.message ??
                    'Could not load pre-shortlist questions.'}
                </AlertDescription>
              </Alert>
            ) : !preShortlistData || preShortlistData.questions.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  This job has no pre-shortlist questions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  {preShortlistData.questions.length} question
                  {preShortlistData.questions.length === 1 ? '' : 's'} ·{' '}
                  {preShortlistData.threshold}% threshold
                </p>
                <div className="space-y-3">
                  {preShortlistData.questions.map((q, idx) => (
                    <Card
                      key={q.id}
                      tone="neutral"
                      className="overflow-hidden p-0"
                    >
                      <div className="flex items-center gap-2 rounded-t-xl bg-slate-50 border-b border-slate-200 px-4 py-3">
                        <span className="size-6 shrink-0 rounded-full bg-slate-100 text-slate-900 text-[11px] font-semibold inline-flex items-center justify-center">
                          Q{idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 break-words min-w-0">
                          {q.question}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right column — Sidebar */}
      <aside className="space-y-6">
        {/* About this role */}
        <div>
          <h3 className="heading-h6-semi-bold mb-4">About this role</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="text-right body-body-1-medium max-w-[180px]">
                {job.remote ? 'Remote' : job.location ?? '—'}
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Job Posted On</dt>
              <dd className="body-body-1-medium">
                {formatDate(job.datePosted)}
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Job Type</dt>
              <dd className="body-body-1-medium">
                {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Salary</dt>
              <dd className="body-body-1-medium">
                {formatSalary(job.salaryCurrency, job.salaryMin, job.salaryMax)}
              </dd>
            </div>
          </dl>
        </div>

        <Separator />

        {/* Category */}
        <div>
          <h3 className="heading-h6-semi-bold mb-3">Category</h3>
          <Badge
            className={`${CATEGORY_COLORS[job.category.name].bg} ${
              CATEGORY_COLORS[job.category.name].text
            } ${
              CATEGORY_COLORS[job.category.name].hoverBg
            } border-0 shadow-none rounded-full`}
          >
            {job.category.name}
          </Badge>
        </div>

        <Separator />

        {/* Skills by Importance */}
        {job.skills.length > 0 && (
          <div>
            <h3 className="heading-h6-semi-bold mb-3">Skills</h3>
            <div className="space-y-4">
              {(
                [
                  { key: 'REQUIRED', label: 'Required' },
                  { key: 'PREFERRED', label: 'Preferred' },
                  { key: 'OPTIONAL', label: 'Nice to Have' },
                ] as const
              )
                .filter(({ key }) =>
                  job.skills.some((s) => s.importance === key)
                )
                .map(({ key, label }) => (
                  <div key={key}>
                    <p className="caption-caption-1-medium text-muted-foreground mb-1.5">
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills
                        .filter((s) => s.importance === key)
                        .map((skill) => (
                          <Badge
                            key={skill.name}
                            className={`bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-0 shadow-none rounded-[5px]`}
                          >
                            {skill.name} (
                            {skill.minYearsExperience &&
                            skill.minYearsExperience > 0
                              ? `${skill.minYearsExperience}+ yrs`
                              : 'Any experience'}
                            )
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
