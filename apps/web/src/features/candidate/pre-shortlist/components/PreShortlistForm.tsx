// apps/web/src/features/candidate/pre-shortlist/components/PreShortlistForm.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PreShortlistApplicationView } from '@/api-client/pre-shortlist';
import { useSubmitPreShortlistAnswers } from '@/api-hook/pre-shortlist';
import { useRouter } from 'next/navigation';

const MIN_LENGTH = 20;
const MAX_LENGTH = 2000;

interface PreShortlistFormProps {
  applicationId: number;
  jobId: number;
  data: PreShortlistApplicationView;
  readOnly?: boolean;
}

export function PreShortlistForm({
  applicationId,
  jobId,
  data,
  readOnly,
}: PreShortlistFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const q of data.questions) {
      const existing = data.answers.find((a) => a.questionId === q.id);
      init[q.id] = existing?.answer ?? '';
    }
    return init;
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useSubmitPreShortlistAnswers(applicationId);

  const allValid = data.questions.every((q) => {
    const a = answers[q.id] ?? '';
    return a.trim().length >= MIN_LENGTH && a.length <= MAX_LENGTH;
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    setSubmitError(null);
    try {
      await submit.mutateAsync({
        answers: data.questions.map((q) => ({
          questionId: q.id,
          answer: (answers[q.id] ?? '').trim(),
        })),
      });
      if (jobId > 0) {
        router.push(`/candidate/find-jobs/${jobId}`);
      } else {
        router.push('/candidate/applications');
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit your answers. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 max-w-2xl mx-auto px-3 sm:px-0 pb-12 sm:pb-16"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          Pre-shortlist questions
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Please answer each question. Your answers will be evaluated by our AI
          and the hiring team will review them before deciding whether to
          advance your application.
        </p>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {data.questions.map((q, idx) => {
          const value = answers[q.id] ?? '';
          const tooShort =
            value.trim().length > 0 && value.trim().length < MIN_LENGTH;
          const tooLong = value.length > MAX_LENGTH;
          return (
            <div key={q.id} className="space-y-2">
              <label
                htmlFor={`q-${q.id}`}
                className="block text-sm font-semibold text-slate-900"
              >
                {idx + 1}. {q.question}{' '}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <Textarea
                id={`q-${q.id}`}
                rows={5}
                value={value}
                maxLength={MAX_LENGTH}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                disabled={submit.isPending || readOnly}
                className={`text-sm ${
                  tooShort || tooLong ? 'border-red-500' : ''
                }`}
                placeholder="Type your answer here (20-2000 characters)..."
              />
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    tooShort
                      ? 'text-red-500'
                      : tooLong
                      ? 'text-red-500'
                      : 'text-slate-500'
                  }
                >
                  {readOnly
                    ? `${value.length} / ${MAX_LENGTH}`
                    : tooShort
                    ? `Answer must be at least ${MIN_LENGTH} characters`
                    : tooLong
                    ? `Answer must be at most ${MAX_LENGTH} characters`
                    : `${value.length} / ${MAX_LENGTH}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {readOnly ? (
        <div className="space-y-3">
          <Alert>
            <AlertDescription>
              Your answers have been submitted. The hiring team will review them
              and let you know the next step.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/candidate/applications')}
            >
              Back to applications
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!allValid || submit.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {submit.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit answers'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
