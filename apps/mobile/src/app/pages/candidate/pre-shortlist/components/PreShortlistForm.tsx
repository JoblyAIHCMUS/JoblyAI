import React, { useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import {
  type PreShortlistApplicationView,
  type PreShortlistApplicationStatus,
} from '../../../../../api/preShortlist';
import { useSubmitPreShortlistAnswers } from '../../../../../hooks/useSubmitPreShortlistAnswers';
import { COLORS } from '@/app/constants/theme';

const MIN_LENGTH = 20;
const MAX_LENGTH = 2000;

const READ_ONLY_STATUSES: PreShortlistApplicationStatus[] = [
  'PRE_SHORTLIST_SUBMITTED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

interface PreShortlistFormProps {
  applicationId: number;
  data: PreShortlistApplicationView;
  readOnly?: boolean;
}

/**
 * Mobile version of apps/web/src/features/candidate/pre-shortlist/components/PreShortlistForm.tsx.
 * Renders one TextInput per question, validates each answer (20-2000 chars),
 * and submits via the candidate pre-shortlist API.
 *
 * readOnly is true for any status past PRE_SHORTLIST_PENDING so the candidate
 * can revisit their submission.
 */
export function PreShortlistForm({
  applicationId,
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

  const submit = useSubmitPreShortlistAnswers(applicationId);

  const allValid = data.questions.every((q) => {
    const a = answers[q.id] ?? '';
    return a.trim().length >= MIN_LENGTH && a.length <= MAX_LENGTH;
  });

  const handleSubmit = () => {
    if (!allValid) return;
    submit.mutate(
      {
        answers: data.questions.map((q) => ({
          questionId: q.id,
          answer: (answers[q.id] ?? '').trim(),
        })),
      },
      {
        onSuccess: () => {
          router.replace('/pages/candidate/my-applications');
        },
      }
    );
  };

  // Defense in depth: if there are no questions (e.g. the employer removed
  // them after the page loaded), don't render a submit button. The page-level
  // guard is the primary check, but this protects against stale caches.
  if (data.questions.length === 0) {
    return (
      <View className="rounded-2xl border border-app-border-light bg-white p-4">
        <Text className="text-base font-semibold text-app-text-4">
          Pre-shortlist questions
        </Text>
        <Text className="mt-2 text-sm text-app-text-5">
          This job no longer has pre-shortlist questions configured. You can
          return to your applications list.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/pages/candidate/my-applications')}
          className="mt-4 items-center rounded-xl border border-app-border-light px-4 py-2.5"
        >
          <Text className="text-sm font-semibold text-app-text-4">
            Back to applications
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="rounded-2xl border border-app-border-light bg-white p-4">
        <Text className="text-[22px] font-bold leading-7 text-app-text-4">
          Pre-shortlist questions
        </Text>
        <Text className="mt-1 text-sm leading-5 text-app-text-5">
          Please answer each question. Your answers will be evaluated by our AI
          and the hiring team will review them before deciding whether to
          advance your application.
        </Text>
      </View>

      {data.questions
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((q, idx) => {
          const value = answers[q.id] ?? '';
          const trimmed = value.trim();
          const tooShort = trimmed.length > 0 && trimmed.length < MIN_LENGTH;
          const tooLong = value.length > MAX_LENGTH;
          const isInvalid = tooShort || tooLong;
          return (
            <View
              key={q.id}
              className="rounded-2xl border border-app-border-light bg-white p-4"
            >
              <Text className="text-sm font-semibold text-app-text-4">
                {idx + 1}. {q.question}{' '}
                <Text className="text-app-red-2">*</Text>
              </Text>
              <TextInput
                value={value}
                onChangeText={(t) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: t }))
                }
                editable={!submit.isPending && !readOnly}
                multiline
                numberOfLines={5}
                maxLength={MAX_LENGTH}
                placeholder="Type your answer here (20-2000 characters)..."
                placeholderTextColor={COLORS.textPlaceholder}
                className={`mt-2 min-h-[120px] rounded-xl border bg-app-background-2 px-3 py-2.5 text-sm text-app-text-4 ${
                  isInvalid ? 'border-app-red-2' : 'border-app-border-light'
                }`}
                textAlignVertical="top"
              />
              <View className="mt-1.5 flex-row items-center justify-between">
                <Text
                  className={`text-xs ${
                    isInvalid ? 'text-app-red-2' : 'text-app-text-5'
                  }`}
                >
                  {readOnly
                    ? `${value.length} / ${MAX_LENGTH}`
                    : tooShort
                    ? `Answer must be at least ${MIN_LENGTH} characters`
                    : tooLong
                    ? `Answer must be at most ${MAX_LENGTH} characters`
                    : `${value.length} / ${MAX_LENGTH}`}
                </Text>
              </View>
            </View>
          );
        })}

      {readOnly ? (
        <View className="rounded-2xl border border-app-border-light bg-app-indigo-soft p-4">
          <View className="flex-row items-center gap-2">
            <CheckCircle2 size={18} color={COLORS.primary2} />
            <Text className="text-sm font-semibold text-app-indigo-strong">
              Your answers have been submitted
            </Text>
          </View>
          <Text className="mt-1.5 text-sm leading-5 text-app-text-5">
            The hiring team will review your answers and let you know the next
            step.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/pages/candidate/my-applications')}
            className="mt-4 flex-row items-center justify-center gap-1.5 rounded-xl border border-app-border-light bg-white px-4 py-2.5"
          >
            <ArrowLeft size={14} color={COLORS.darkText} strokeWidth={2.2} />
            <Text className="text-sm font-semibold text-app-text-4">
              Back to applications
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!allValid || submit.isPending}
          activeOpacity={0.8}
          className={`items-center justify-center rounded-2xl py-3.5 ${
            allValid && !submit.isPending
              ? 'bg-app-primary-2'
              : 'bg-app-bg-disabled'
          }`}
          style={{ opacity: allValid && !submit.isPending ? 1 : 0.6 }}
        >
          {submit.isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text className="text-sm font-semibold text-white">
                Submitting...
              </Text>
            </View>
          ) : (
            <Text
              className={`text-sm font-semibold ${
                allValid ? 'text-white' : 'text-app-text-placeholder'
              }`}
            >
              Submit answers
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
