// apps/web/src/features/employer/new-job/components/PreShortlistStep.tsx

'use client';

import { useCallback } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { Sparkles, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

export function PreShortlistStep() {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<JobPostingFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'preShortlistQuestions' as never,
  });

  const jobTitle = useWatch({ control, name: 'title' });
  const jobDescription = useWatch({ control, name: 'description' });
  const skills = useWatch({ control, name: 'skills' });

  const { generate, loading: generating } = useGeneratePreShortlistQuestions();

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
        const result = await generate({
          title: jobTitle,
          description: jobDescription,
          requirements,
        });
        const previousSnapshot = getValues(
          'preShortlistQuestions'
        ) as unknown as QuestionDraft[];
        const undoId = makeId();
        try {
          localStorage.setItem(
            `${UNDO_STORAGE_KEY_PREFIX}${undoId}`,
            JSON.stringify(previousSnapshot ?? [])
          );
        } catch {
          // localStorage may be disabled (SSR, private mode); ignore.
        }
        setValue('preShortlistQuestions', result.questions, {
          shouldValidate: true,
          shouldDirty: true,
        });
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
        <div className="space-y-1">
          <Input
            type="number"
            min={0}
            max={100}
            className={`h-10 sm:h-12 text-sm sm:text-base ${
              errors.preShortlistThreshold ? 'border-red-500' : ''
            }`}
            {...register('preShortlistThreshold', { valueAsNumber: true })}
          />
          {errors.preShortlistThreshold && (
            <p className="text-xs sm:text-sm text-red-500">
              {errors.preShortlistThreshold.message}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label className="label-label-1-semibold text-sm sm:text-base">
              Pre-shortlist questions
            </Label>
            <p className="text-xs text-slate-500 mt-1">
              These will be served to every candidate who passes the threshold.
              Each question is answerable in 2-5 sentences.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
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
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </span>
            )}
          </Button>
        </div>

        {fields.length === 0 && (
          <Alert>
            <AlertDescription>
              No questions yet. Click "Generate with AI" to draft 5 questions,
              or add one manually below.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="rounded-lg border border-slate-200 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Question {idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === fields.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    aria-label="Remove question"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Question
                </Label>
                <Textarea
                  rows={2}
                  maxLength={MAX_LENGTH}
                  placeholder="e.g. Describe a Postgres query you optimized and the impact it had."
                  className="text-sm mt-1"
                  {...register(`preShortlistQuestions.${idx}.question` as const)}
                />
                {errors.preShortlistQuestions?.[idx]?.question && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.preShortlistQuestions[idx]?.question?.message as string}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Expected answer
                </Label>
                <p className="text-xs text-slate-500 mb-1">
                  What a strong response would include. The candidate won't see
                  this.
                </p>
                <Textarea
                  rows={2}
                  maxLength={MAX_LENGTH}
                  placeholder="e.g. A concrete optimization with a measured impact (e.g. latency drop, query time reduction)."
                  className="text-sm"
                  {...register(
                    `preShortlistQuestions.${idx}.expectedAnswer` as const
                  )}
                />
                {errors.preShortlistQuestions?.[idx]?.expectedAnswer && (
                  <p className="text-xs text-red-500 mt-1">
                    {
                      errors.preShortlistQuestions[idx]?.expectedAnswer
                        ?.message as string
                    }
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {fields.length < MAX_QUESTIONS && (
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
        )}
      </div>
    </div>
  );
}
