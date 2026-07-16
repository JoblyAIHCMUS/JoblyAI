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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AiBadge } from '@/components/ui/ai-badge';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { FieldShell } from '@/components/ui/field-shell';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useGeneratePreShortlistQuestions } from '@/api-hook/pre-shortlist';
import { PreShortlistInfoButton } from '@/components/employer/preShortlist/PreShortlistInfoButton';
import type { GenerateQuestionsRequest } from '@/api-client/pre-shortlist';
import type { JobPostingFormData } from '../schema';

const MAX_QUESTIONS = 20;
const MAX_LENGTH = 10_000;
const UNDO_STORAGE_KEY_PREFIX = 'joblyai:pre-shortlist-undo:';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

type QuestionDraft = { question: string; expectedAnswer: string };
type AiBadgeState = Record<number, boolean>;

interface QuestionCardProps {
  index: number;
  readOnly?: boolean;
  showAiBadge: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

function QuestionCard({
  index,
  readOnly = false,
  showAiBadge,
  onEdit,
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
                rows={4}
                maxLength={MAX_LENGTH}
                placeholder="e.g. Describe a Postgres query you optimized and the impact it had."
                className="text-sm min-h-24 resize-none focus-visible:ring-0 focus-visible:border-[color:var(--indigo-400)] focus-visible:shadow-[0_0_0_3px_var(--indigo-400)]"
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
                rows={4}
                maxLength={MAX_LENGTH}
                placeholder="e.g. A concrete optimization with a measured impact (e.g. latency drop, query time reduction)."
                className="text-sm min-h-24 resize-none focus-visible:ring-0 focus-visible:border-[color:var(--indigo-400)] focus-visible:shadow-[0_0_0_3px_var(--indigo-400)]"
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

export function PreShortlistStep({
  readOnly = false,
  configLocked = false,
}: {
  readOnly?: boolean;
  configLocked?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<JobPostingFormData>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'preShortlistQuestions' as never,
  });

  const jobTitle = useWatch({ control, name: 'title' });
  const jobDescription = useWatch({ control, name: 'description' });
  const skills = useWatch({ control, name: 'skills' });
  const preShortlistEnabled =
    useWatch({ control, name: 'preShortlistEnabled' }) ?? false;

  const { generate, loading: generating } = useGeneratePreShortlistQuestions();

  const [aiSuggested, setAiSuggested] = useState<AiBadgeState>({});
  const [generateCount, setGenerateCount] = useState<number>(5);
  const [clearOpen, setClearOpen] = useState<boolean>(false);

  const onGenerate = useCallback(
    async ({
      jobTitle,
      jobDescription,
      requirements,
      count,
    }: {
      jobTitle: string;
      jobDescription: string;
      requirements: GenerateQuestionsRequest['requirements'];
      count: number;
    }) => {
      if (!jobTitle?.trim() || !jobDescription?.trim()) {
        toast.error('Please fill in the job title and description first.');
        return;
      }
      const available = MAX_QUESTIONS - fields.length;
      if (available <= 0) {
        toast.error(
          'You already have 20 questions. Remove some to generate more.'
        );
        return;
      }
      const effectiveCount = Math.max(1, Math.min(count, available));
      const previousSnapshot = [...fields];
      const undoId = makeId();
      try {
        localStorage.setItem(
          `${UNDO_STORAGE_KEY_PREFIX}${undoId}`,
          JSON.stringify(previousSnapshot)
        );
      } catch {
        // localStorage may be disabled (SSR, private mode); ignore.
      }
      try {
        const result = await generate({
          title: jobTitle,
          description: jobDescription,
          requirements,
          count: effectiveCount,
        });
        replace([...fields, ...result.questions]);
        const nextSuggested: AiBadgeState = { ...aiSuggested };
        result.questions.forEach((_, i) => {
          nextSuggested[fields.length + i] = true;
        });
        setAiSuggested(nextSuggested);
        const capped = effectiveCount < count;
        toast.success(
          capped
            ? `Added ${effectiveCount} questions (capped at ${MAX_QUESTIONS})`
            : `Added ${effectiveCount} questions`,
          {
            action: {
              label: 'Undo',
              onClick: () => {
                try {
                  const raw = localStorage.getItem(
                    `${UNDO_STORAGE_KEY_PREFIX}${undoId}`
                  );
                  if (raw) {
                    const restored = JSON.parse(raw) as Array<{
                      question: string;
                      expectedAnswer: string;
                    }>;
                    replace(restored);
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
          }
        );
      } catch {
        // toast handled in hook
      }
    },
    [generate, replace, fields, aiSuggested]
  );

  const lockMessage =
    'Pre-shortlist configuration is locked once applications have been received. To change these settings, create a new job.';

  const LockOverlay = ({
    ariaLabel,
  }: {
    ariaLabel: string;
  }) => (
    <div
      className="absolute inset-0 z-10 cursor-not-allowed"
      onClick={() => toast.error(lockMessage)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toast.error(lockMessage);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
    />
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-3 sm:px-0">
      {/* Lock banner */}
      {configLocked && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {lockMessage}
        </div>
      )}

      {/* Enable toggle with lock overlay */}
      <div className="relative">
        {configLocked && (
          <LockOverlay ariaLabel="Locked: pre-shortlist configuration cannot be changed" />
        )}
        <Controller
          control={control}
          name="preShortlistEnabled"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3">
              <div>
                <Label className="label-label-1-semibold text-sm sm:text-base">
                  Enable pre-shortlist screening
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  Turn off to skip the pre-shortlist step entirely. Candidates
                  will go directly to APPLIED.
                </p>
              </div>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={configLocked}
                className="data-[state=checked]:bg-indigo-600"
                aria-label="Enable pre-shortlist screening"
              />
            </div>
          )}
        />
      </div>

      {/* Body: threshold + questions (only when enabled) */}
      {preShortlistEnabled ? (
        <div className="space-y-6">
          {/* Threshold with lock overlay */}
          <div className="relative">
            {configLocked && (
              <LockOverlay ariaLabel="Locked: pre-shortlist threshold cannot be changed" />
            )}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6 items-start">
              <div className="pt-0 md:pt-3">
                <Label className="label-label-1-semibold text-sm sm:text-base">
                  Matching threshold
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  Candidates whose AI match score is at or above this number
                  will be invited to answer your pre-shortlist questions.
                  Threshold of 0 invites every candidate. Higher values are
                  stricter.
                </p>
              </div>
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="preShortlistThreshold"
                  render={({ field }) => {
                    const value =
                      typeof field.value === 'number' ? field.value : 0;
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
                            disabled={configLocked}
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
                  <span>0 · Everyone</span>
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
          </div>

          {/* Labeled divider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              Pre-shortlist questions
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Questions section with lock overlay */}
          <div className="relative">
            {configLocked && (
              <LockOverlay ariaLabel="Locked: pre-shortlist questions cannot be changed" />
            )}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label className="label-label-1-semibold text-sm sm:text-base">
                    Pre-shortlist questions
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    These will be served to every candidate who passes the
                    threshold. Each question is answerable in 2-5 sentences.
                  </p>
                </div>
                {!readOnly && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] text-tertiary">
                        <span>How many</span>
                        <input
                          type="number"
                          min={1}
                          max={MAX_QUESTIONS}
                          value={generateCount}
                          onChange={(e) => {
                            const next = Number.parseInt(e.target.value, 10);
                            if (Number.isFinite(next)) {
                              setGenerateCount(
                                Math.max(1, Math.min(MAX_QUESTIONS, next))
                              );
                            } else if (e.target.value === '') {
                              setGenerateCount(1);
                            }
                          }}
                          disabled={
                            generating || fields.length >= MAX_QUESTIONS
                          }
                          className="h-8 w-14 rounded-md border border-slate-200 bg-white px-2 text-center text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ai-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Number of questions to generate"
                        />
                      </label>
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
                              minYearsExperience:
                                s.minYearsExperience ?? null,
                            })),
                            count: generateCount,
                          })
                        }
                        disabled={
                          generating || fields.length >= MAX_QUESTIONS
                        }
                        className="shrink-0"
                      >
                        <Sparkles className="h-4 w-4" />
                        {generating ? 'Generating…' : 'Generate with AI'}
                      </Button>
                      <PreShortlistInfoButton kind="generate" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setClearOpen(true)}
                      disabled={fields.length === 0}
                      className="shrink-0"
                    >
                      Clear all
                    </Button>
                  </div>
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
                    <p className="mt-2 text-base font-semibold">
                      No questions yet
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Generate with AI to draft some based on your job
                      description, or add one manually.
                    </p>
                  </div>
                )
              ) : null}

              {/* Populated question list */}
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <QuestionCard
                    key={field.id}
                    index={idx}
                    readOnly={readOnly}
                    showAiBadge={!readOnly && aiSuggested[idx] === true}
                    onEdit={() =>
                      setAiSuggested((prev) =>
                        prev[idx] === true
                          ? { ...prev, [idx]: false }
                          : prev
                      )
                    }
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
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic">
          Pre-shortlist is disabled. Candidates will skip the screening step.
        </p>
      )}

      <DeleteConfirmDialog
        open={clearOpen}
        title="Remove all questions?"
        description="You can regenerate with AI afterwards."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onOpenChange={setClearOpen}
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          replace([]);
          setAiSuggested({});
          setClearOpen(false);
        }}
      />
    </div>
  );
}
