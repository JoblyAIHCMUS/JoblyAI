// apps/web/src/components/employer/applicantProfile/PreShortlistAssessment.tsx

'use client';

import {
  useEmployerPreShortlist,
  useRetryPreShortlistEvaluation,
} from '@/api-hook/pre-shortlist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { PreShortlistLlmStatus } from '@/api-client/pre-shortlist';

const STATUS_LABEL: Record<PreShortlistLlmStatus, string> = {
  STRONG_FIT: 'Strong Fit',
  GOOD_FIT: 'Good Fit',
  NEUTRAL: 'Neutral',
  POOR_FIT: 'Poor Fit',
};

const STATUS_STYLES: Record<PreShortlistLlmStatus, string> = {
  STRONG_FIT: 'border-green-500 text-green-700 bg-green-50',
  GOOD_FIT: 'border-blue-500 text-blue-700 bg-blue-50',
  NEUTRAL: 'border-slate-400 text-slate-700 bg-slate-50',
  POOR_FIT: 'border-red-500 text-red-700 bg-red-50',
};

const SUGGESTION_STYLES: Record<string, string> = {
  STRONG: 'border-green-500 text-green-700 bg-green-50',
  MAYBE: 'border-amber-500 text-amber-700 bg-amber-50',
  NO: 'border-red-500 text-red-700 bg-red-50',
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
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : 'Could not load pre-shortlist data.'}
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
        <h3 className="text-sm font-semibold text-slate-900">
          Pre-shortlist questions
        </h3>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-900">
          Pre-shortlist assessment
        </h3>
        {isFailed && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => retry.mutate()}
            disabled={retry.isPending}
          >
            {retry.isPending ? 'Re-queuing…' : 'Retry evaluation'}
          </Button>
        )}
      </div>

      {isFailed && data.preShortlistError && (
        <Alert variant="destructive">
          <AlertDescription>
            AI evaluation failed: {data.preShortlistError}
          </AlertDescription>
        </Alert>
      )}

      {!isFailed && data.overall && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall verdict</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${
                  SUGGESTION_STYLES[data.overall.suggestion] ?? ''
                } text-xs py-1 px-2`}
              >
                {data.overall.suggestion}
              </Badge>
              <span className="text-xs text-slate-500">
                Score: {data.overall.overallScore}/100
              </span>
            </div>
            <p className="text-sm text-slate-700">{data.overall.comment}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {data.questions.map((q, idx) => {
          const ans = data.answers.find((a) => a.questionId === q.id);
          return (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {idx + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ans ? (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {ans.answer}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">No answer.</p>
                )}
                {isPending ? (
                  <Skeleton className="h-12 w-full" />
                ) : ans?.llmStatus ? (
                  <div className="space-y-1.5">
                    <Badge
                      variant="outline"
                      className={`${
                        STATUS_STYLES[ans.llmStatus]
                      } text-xs py-1 px-2`}
                    >
                      {STATUS_LABEL[ans.llmStatus]} · {ans.llmScore ?? 0}/100
                    </Badge>
                    {ans.llmComment && (
                      <p className="text-xs text-slate-600">{ans.llmComment}</p>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
