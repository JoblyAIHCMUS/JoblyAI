import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Zap } from 'lucide-react-native';

import { HiringStage } from '../../types';
import { hiringStageStyles, nextStageMap } from '../../data';
import { COLORS } from '@/app/constants/theme';

interface HiringProcessPanelProps {
  hiringStage: HiringStage;
  onRequestAdvance: () => void;
  onRequestDecline: () => void;
  disabled?: boolean;
  score?: number;
}

export function HiringProcessPanel({
  hiringStage,
  onRequestAdvance,
  onRequestDecline,
  disabled = false,
  score,
}: HiringProcessPanelProps) {
  const nextStage = nextStageMap[hiringStage];
  const canReject = hiringStage !== 'Rejected';
  const canAdvance =
    !!nextStage &&
    hiringStage !== 'Rejected' &&
    hiringStage !== 'Withdrawn' &&
    hiringStage !== 'Offer';

  const rawScore = score ?? 0;
  const displayScore =
    rawScore <= 1 && rawScore > 0 ? rawScore * 100 : rawScore;
  const roundedScore = Math.round(displayScore);

  return (
    <View>
      <View className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-4 mb-4">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
            <Text className="text-base font-extrabold text-white">
              {roundedScore}%
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold text-app-slate-1">
                AI Match Score
              </Text>
            </View>
            <Text className="text-xs text-app-text-5 mt-0.5">
              Profile &amp; resume fit with job requirements
            </Text>
          </View>
        </View>

        {roundedScore >= 60 && (
          <View className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Zap size={14} color={COLORS.warningText} />
              <Text className="text-xs font-bold text-amber-900">
                Employer Consideration Highlight
              </Text>
            </View>
            <Text className="text-xs text-amber-800 leading-4">
              High match score ({roundedScore}%). Consider reviewing full
              candidate profile before making a decision even if pre-shortlist
              answers are not optimal.
            </Text>
          </View>
        )}
      </View>

      <View className="rounded-2xl border border-app-border-2 bg-white p-4 mb-4">
        <Text className="text-sm font-semibold text-app-text-3 mb-3">
          Current stage
        </Text>

        <View
          className={`self-start border rounded-full px-4 py-2 mb-4 ${hiringStageStyles[hiringStage]}`}
        >
          <Text className="text-sm font-semibold">{hiringStage}</Text>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onRequestDecline}
            disabled={disabled || !canReject}
            activeOpacity={0.7}
            className="flex-1 py-3 rounded-xl border border-app-red-1 items-center"
            style={{ opacity: disabled || !canReject ? 0.5 : 1 }}
          >
            <Text className="text-sm font-semibold text-app-red-1">Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRequestAdvance}
            disabled={disabled || !canAdvance}
            activeOpacity={0.7}
            className="flex-1 py-3 rounded-xl bg-app-primary-1 items-center"
            style={{ opacity: disabled || !canAdvance ? 0.5 : 1 }}
          >
            <Text className="text-sm font-semibold text-white">Next Stage</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="h-px bg-app-border-2 mb-4" />
    </View>
  );
}
