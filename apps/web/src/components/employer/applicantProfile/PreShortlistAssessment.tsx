// apps/web/src/components/employer/applicantProfile/PreShortlistAssessment.tsx

'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  useEmployerPreShortlist,
  useRetryPreShortlistEvaluation,
} from '@/api-hook/pre-shortlist';
import { AiBadge } from '@/components/ui/ai-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionBlock } from '@/components/ui/section-block';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { PreShortlistSuggestion } from '@/api-client/pre-shortlist';

const SUGGESTION_BORDER: Record<
  PreShortlistSuggestion,
  { border: string; tone: 'success' | 'warning' | 'danger' }
> = {
  STRONG: {
    border: 'border-l-[var(--success-accent)]',
    tone: 'success',
  },
  MAYBE: {
    border: 'border-l-[var(--warning-accent)]',
    tone: 'warning',
  },
  NO: {
    border: 'border-l-[var(--danger-accent)]',
    tone: 'danger',
  },
};

const SUGGESTION_LABEL_COLOR: Record<PreShortlistSuggestion, string> = {
  STRONG: 'text-[var(--success-accent)]',
  MAYBE: 'text-[var(--warning-accent)]',
  NO: 'text-[var(--danger-accent)]',
};

const SUGGESTION_HEADLINE: Record<PreShortlistSuggestion, string> = {
  STRONG: 'Strong fit',
  MAYBE: 'Maybe',
  NO: 'Not a fit',
};

interface PreShortlistAssessmentProps {
  applicationId: string;
  jobId: string;
}

export default function PreShortlistAssessment({
  applicationId,
  jobId,
}: PreShortlistAssessmentProps) {
  const { data, isLoading, isError, error } = useEmployerPreShortlist(
    Number(applicationId)
  );
  const retry = useRetryPreShortlistEvaluation(Number(applicationId));

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center gap-2">
          <AiBadge variant="danger">Failed</AiBadge>
          <span>
            {error instanceof Error
              ? error.message
              : 'Could not load pre-shortlist data.'}
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // The job has no pre-shortlist configured — render nothing.
  if (data.questions.length === 0) return null;

  // Candidate hasn't answered yet.
  if (data.status === 'PRE_SHORTLIST_PENDING') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Pre-shortlist questions
          </h3>
          <AiBadge variant="ai">Pending</AiBadge>
        </div>
        <Alert>
          <AlertDescription>
            Waiting for the candidate to submit their answers.
          </AlertDescription>
        </Alert>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
          {data.questions.map((q) => (
            <li key={q.id}>{q.question}</li>
          ))}
        </ol>
      </div>
    );
  }

  // Candidate has answered, but the LLM hasn't finished (or failed).
  const isPending = data.preShortlistStatus === 'PENDING';
  const isFailed = data.preShortlistStatus === 'FAILED';

  const statusBadge = (() => {
    if (isFailed) return <AiBadge variant="danger">Failed</AiBadge>;
    if (isPending) return <AiBadge variant="ai">Evaluating…</AiBadge>;
    if (data.preShortlistStatus === 'COMPLETED')
      return <AiBadge variant="success">Ready</AiBadge>;
    return null;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-0.5">
          <h3
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--family-primary)' }}
          >
            Pre-shortlist assessment
          </h3>
          <p className="text-xs text-tertiary">
            {data.questions.length} questions · {data.threshold}% threshold
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          {isFailed ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => retry.mutate()}
              disabled={retry.isPending}
            >
              {retry.isPending ? 'Re-queuing…' : 'Retry evaluation'}
            </Button>
          ) : null}
        </div>
      </div>

      {isFailed && data.preShortlistError ? (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <AiBadge variant="danger">Failed</AiBadge>
            <span>AI evaluation failed: {data.preShortlistError}</span>
          </AlertDescription>
        </Alert>
      ) : null}

      {!isFailed && data.overall ? (
        <Card
          tone="neutral"
          className={`border-l-4 ${SUGGESTION_BORDER[data.overall.suggestion].border} pre-shortlist-reveal`}
        >
          <CardContent className="p-4 space-y-2 min-w-0 break-words">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              Overall verdict
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${SUGGESTION_LABEL_COLOR[data.overall.suggestion]}`}
                style={{ fontFamily: 'var(--family-primary)' }}
              >
                {SUGGESTION_HEADLINE[data.overall.suggestion]}
              </span>
              <AiBadge variant={SUGGESTION_BORDER[data.overall.suggestion].tone}>
                AI evaluated
              </AiBadge>
            </div>
            <LineClamp text={data.overall.comment} lines={8} />
            <p className="pt-1 text-right text-[11px] text-tertiary tabular-nums">
              Threshold · {data.threshold}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {data.questions.map((q, idx) => {
          const ans = data.answers.find((a) => a.questionId === q.id);
          const delay = Math.min(idx, 7) * 30;
          return (
            <Card
              key={q.id}
              tone="neutral"
              className="pre-shortlist-reveal overflow-hidden p-0"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap min-w-0 rounded-t-xl bg-slate-50 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0 flex-1 basis-full sm:basis-auto">
                  <span className="size-6 shrink-0 rounded-full bg-slate-100 text-slate-900 text-[11px] font-semibold inline-flex items-center justify-center">
                    Q{idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 break-words min-w-0">
                    {q.question}
                  </p>
                </div>
                {ans?.llmComment ? <AiBadge variant="ai">Evaluated</AiBadge> : null}
              </div>
              <CardContent className="p-4 space-y-3">
                <SectionBlock label="Expected answer" tone="neutral">
                  {q.expectedAnswer && q.expectedAnswer.trim() ? (
                    <LineClamp text={q.expectedAnswer} lines={5} />
                  ) : (
                    <span className="italic text-tertiary">
                      Not provided.
                    </span>
                  )}
                </SectionBlock>
                <SectionBlock label="Candidate's answer" tone="neutral">
                  {isPending ? (
                    <Skeleton className="h-12 w-full" />
                  ) : ans ? (
                    <LineClamp text={ans.answer} lines={6} />
                  ) : (
                    <span className="italic text-tertiary">
                      No answer.
                    </span>
                  )}
                </SectionBlock>
                {ans?.llmComment && !isPending ? (
                  <SectionBlock
                    label="AI comment"
                    tone="ai"
                    icon={<Sparkles className="h-3 w-3" aria-hidden="true" />}
                  >
                    <LineClamp text={ans.llmComment} lines={6} />
                  </SectionBlock>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LineClamp({ text, lines }: { text: string; lines: number }) {
  const [open, setOpen] = useState(false);
  const isLong = text.split('\n').length > lines || text.length > 240;
  if (!isLong) {
    return <p className="whitespace-pre-wrap break-words">{text}</p>;
  }
  return (
    <div>
      <p
        className="whitespace-pre-wrap break-words"
        style={
          open
            ? undefined
            : {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical' as const,
                WebkitLineClamp: lines,
                overflow: 'hidden',
              }
        }
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 text-[11px] font-medium text-accent-primary hover:underline"
      >
        {open ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}
