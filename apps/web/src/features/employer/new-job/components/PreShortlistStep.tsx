// apps/web/src/features/employer/new-job/components/PreShortlistStep.tsx

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Controller,
  useFormContext,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AiBadge } from '@/components/ui/ai-badge';
import { FieldShell } from '@/components/ui/field-shell';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useGeneratePreShortlistQuestions } from '@/api-hook/pre-shortlist';
import type { GenerateQuestionsRequest } from '@/api-client/pre-shortlist';
import type { JobPostingFormData } from '../schema';

const MAX_QUESTIONS = 20;
const MAX_LENGTH = 500;
const UNDO_STORAGE_KEY_PREFIX = 'joblyai:pre-shortlist-undo:';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

type QuestionDraft = { question: string; expectedAnswer: string };
type AiBadgeState = Record<number, boolean>;

interface QuestionCardProps {
  index: number;
  total: number;
  readOnly?: boolean;
  showAiBadge: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function QuestionCard({
  index,
  total,
  readOnly = false,
  showAiBadge,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: QuestionCardProps) {
  const { control, register, formState } = useFormContext<JobPostingFormData>();
  const errors = formState.errors;

  const watchedQuestion =
    (useWatch({
      control,
      name: `preShortlistQuestions.${index}.question` as const,
    }) as string | undefined) ?? '';
  const watchedExpected =
    (useWatch({
      control,
      name: `preShortlistQuestions.${index}.expectedAnswer` as const,
    }) as string | undefined) ?? '';

  useEffect(() => {
    if (showAiBadge && (watchedQuestion || watchedExpected)) {
      onEdit();
    }
  }, [showAiBadge, watchedQuestion, watchedExpected, onEdit]);

  return (
    <div
      className="rounded-xl border border-[var(--ai-surface-border)] bg-[var(--ai-surface)] transition-colors duration-150 ease-out"
      style={
        showAiBadge
          ? { boxShadow: '0 0 0 1px var(--ai-surface-border)' }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-2 rounded-t-xl bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-6 shrink-0 rounded-full bg-slate-100 text-slate-900 text-[11px] font-semibold inline-flex items-center justify-center">
            Q{index + 1}
          </span>
          <span className="text-[11px] tabular-nums text-tertiary">
            Question {index + 1} · {watchedQuestion.length}/{MAX_LENGTH}{' '}
            characters
          </span>
          {showAiBadge ? <AiBadge variant="ai">AI suggested</AiBadge> : null}
        </div>
        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-hidden="true"
                tabIndex={-1}
              >
                <GripVertical className="h-4 w-4 text-slate-400" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveUp}
                disabled={index === 0}
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveDown}
                disabled={index === total - 1}
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRemove}
                aria-label="Remove question"
              >
                <Trash2 className="h-4 w-4 text-[var(--danger-accent)]" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-4 p-4">
        <FieldShell
          label="Your question"
          helper={readOnly ? undefined : 'The candidate sees this.'}
          maxLength={MAX_LENGTH}
          currentLength={watchedQuestion.length}
          error={
            errors.preShortlistQuestions?.[index]?.question?.message as
              | string
              | undefined
          }
        >
          {readOnly ? (
            <div className="rounded-md bg-white border border-slate-200 px-3 py-2 text-sm whitespace-pre-wrap break-words">
              {watchedQuestion || (
                <span className="text-slate-400">(empty)</span>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-white">
              <Textarea
                rows={2}
                maxLength={MAX_LENGTH}
                placeholder="e.g. Describe a Postgres query you optimized and the impact it had."
                className="text-sm"
                {...register(
                  `preShortlistQuestions.${index}.question` as const
                )}
              />
            </div>
          )}
        </FieldShell>
        <FieldShell
          label="Expected answer"
          helper={
            readOnly
              ? undefined
              : 'Not shown to the candidate. Used to score their response.'
          }
          maxLength={MAX_LENGTH}
          currentLength={watchedExpected.length}
          error={
            errors.preShortlistQuestions?.[index]?.expectedAnswer?.message as
              | string
              | undefined
          }
        >
          {readOnly ? (
            <div className="rounded-md bg-white border border-slate-200 px-3 py-2 text-sm whitespace-pre-wrap break-words">
              {watchedExpected || (
                <span className="text-slate-400">(empty)</span>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-white">
              <Textarea
                rows={2}
                maxLength={MAX_LENGTH}
                placeholder="e.g. A concrete optimization with a measured impact (e.g. latency drop, query time reduction)."
                className="text-sm"
                {...register(
                  `preShortlistQuestions.${index}.expectedAnswer` as const
                )}
              />
            </div>
          )}
        </FieldShell>
      </div>
    </div>
  );
}

export function PreShortlistStep({ readOnly = false }: { readOnly?: boolean }) {
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<JobPostingFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'preShortlistQuestions' as never,
  });

  const jobTitle = useWatch({ control, name: 'title' });
  const jobDescription = useWatch({ control, name: 'description' });
  const skills = useWatch({ control, name: 'skills' });

  const { generate, loading: generating } = useGeneratePreShortlistQuestions();

  const [aiSuggested, setAiSuggested] = useState<AiBadgeState>({});

  const onGenerate = useCallback(
    async ({
      jobTitle,
      jobDescription,
      requirements,
    }: {
      jobTitle: string;
      jobDescription: string;
      requirements: GenerateQuestionsRequest['requirements'];
    }) => {
      if (!jobTitle?.trim() || !jobDescription?.trim()) {
        toast.error('Please fill in the job title and description first.');
        return;
      }
      try {
        const previousSnapshot = getValues(
          'preShortlistQuestions'
        ) as unknown as QuestionDraft[];
        const preIndexSet = new Set(previousSnapshot.map((_, i) => i));
        const undoId = makeId();
        try {
          localStorage.setItem(
            `${UNDO_STORAGE_KEY_PREFIX}${undoId}`,
            JSON.stringify(previousSnapshot ?? [])
          );
        } catch {
          // localStorage may be disabled (SSR, private mode); ignore.
        }
        const result = await generate({
          title: jobTitle,
          description: jobDescription,
          requirements,
        });
        setValue('preShortlistQuestions', result.questions, {
          shouldValidate: true,
          shouldDirty: true,
        });
        const nextSuggested: AiBadgeState = {};
        result.questions.forEach((_, i) => {
          if (!preIndexSet.has(i)) nextSuggested[i] = true;
        });
        setAiSuggested(nextSuggested);
        toast.success('Replaced with AI suggestions', {
          description: '5 questions generated.',
          action: {
            label: 'Undo',
            onClick: () => {
              try {
                const raw = localStorage.getItem(
                  `${UNDO_STORAGE_KEY_PREFIX}${undoId}`
                );
                if (raw) {
                  const restored = JSON.parse(raw) as QuestionDraft[];
                  setValue('preShortlistQuestions', restored, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setAiSuggested({});
                  localStorage.removeItem(
                    `${UNDO_STORAGE_KEY_PREFIX}${undoId}`
                  );
                }
              } catch {
                // ignore
              }
            },
          },
          duration: 5_000,
        });
      } catch {
        // toast handled in hook
      }
    },
    [generate, getValues, setValue]
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-3 sm:px-0">
      {/* Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
        <div className="pt-0 md:pt-3">
          <Label className="label-label-1-semibold text-sm sm:text-base">
            Matching threshold
          </Label>
          <p className="text-xs text-slate-500 mt-1">
            Candidates whose AI match score is at or above this number will be
            invited to answer your pre-shortlist questions. Set to 0 to disable.
          </p>
        </div>
        <div className="space-y-2">
          <Controller
            control={control}
            name="preShortlistThreshold"
            render={({ field }) => {
              const value = typeof field.value === 'number' ? field.value : 0;
              const pillClass =
                value === 0
                  ? 'text-slate-700 bg-slate-50 border border-transparent'
                  : value >= 80
                  ? 'text-[var(--ai-accent)] bg-[var(--ai-accent-soft)] border border-[var(--ai-accent)]'
                  : 'text-[var(--ai-accent)] bg-white border border-[var(--ai-accent-soft)]';
              return (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[value]}
                      onValueChange={(v) => field.onChange(v[0] ?? 0)}
                      aria-label="Matching threshold"
                    />
                  </div>
                  <span
                    className={`min-w-[3rem] text-center text-sm font-semibold tabular-nums rounded-md px-2 py-1 ${pillClass}`}
                  >
                    {value}
                  </span>
                </div>
              );
            }}
          />
          <div className="flex justify-between text-[11px] text-tertiary tabular-nums">
            <span>0 · Disable</span>
            <span>50 · Balanced</span>
            <span>80 · Strict</span>
          </div>
          {errors.preShortlistThreshold ? (
            <p className="text-xs sm:text-sm text-red-500">
              {errors.preShortlistThreshold.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Labeled divider */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">
          Pre-shortlist questions
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Questions header + AI button */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label className="label-label-1-semibold text-sm sm:text-base">
              Pre-shortlist questions
            </Label>
            <p className="text-xs text-slate-500 mt-1">
              These will be served to every candidate who passes the threshold.
              Each question is answerable in 2-5 sentences.
            </p>
          </div>
          {!readOnly && (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                onGenerate({
                  jobTitle: jobTitle ?? '',
                  jobDescription: jobDescription ?? '',
                  requirements: (skills ?? []).map((s) => ({
                    skillName: s.name,
                    importance: s.importance,
                    minYearsExperience: s.minYearsExperience ?? null,
                  })),
                })
              }
              disabled={generating}
              className="shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating…' : 'Generate with AI'}
            </Button>
          )}
        </div>

        {generating ? (
          <div
            className="overflow-hidden rounded-full bg-[var(--ai-accent-soft)]"
            style={{ height: 2 }}
            aria-label="Generating questions"
          >
            <div
              className="h-full w-2/5 bg-[var(--ai-accent)]"
              style={{
                animation:
                  'pre-shortlist-indeterminate 1.2s ease-in-out infinite',
              }}
            />
          </div>
        ) : null}

        {/* Empty state */}
        {fields.length === 0 && !generating ? (
          readOnly ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-semibold">
                No pre-shortlist questions
              </p>
              <p className="mt-1 text-xs text-slate-600">
                No pre-shortlist questions are configured for this job.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Sparkles
                className="mx-auto h-8 w-8 text-[var(--ai-accent)]"
                aria-hidden="true"
              />
              <p className="mt-2 text-base font-semibold">No questions yet</p>
              <p className="mt-1 text-sm text-slate-600">
                Generate with AI to draft 5 based on your job description, or
                add one manually.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={() =>
                  onGenerate({
                    jobTitle: jobTitle ?? '',
                    jobDescription: jobDescription ?? '',
                    requirements: (skills ?? []).map((s) => ({
                      skillName: s.name,
                      importance: s.importance,
                      minYearsExperience: s.minYearsExperience ?? null,
                    })),
                  })
                }
                disabled={generating}
              >
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          )
        ) : null}

        {/* Populated question list */}
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <QuestionCard
              key={field.id}
              index={idx}
              total={fields.length}
              readOnly={readOnly}
              showAiBadge={!readOnly && aiSuggested[idx] === true}
              onEdit={() =>
                setAiSuggested((prev) =>
                  prev[idx] === true ? { ...prev, [idx]: false } : prev
                )
              }
              onMoveUp={() => move(idx, idx - 1)}
              onMoveDown={() => move(idx, idx + 1)}
              onRemove={() => remove(idx)}
            />
          ))}
        </div>

        {!readOnly && fields.length < MAX_QUESTIONS ? (
          <div className="pt-1">
            <p className="text-[11px] text-tertiary mb-2">
              Up to {MAX_QUESTIONS} questions
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                (append as (v: QuestionDraft) => void)({
                  question: '',
                  expectedAnswer: '',
                })
              }
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" /> Add question
            </Button>
          </div>
        ) : (
          <p className="text-[11px] text-tertiary">Maximum reached</p>
        )}
      </div>
    </div>
  );
}
