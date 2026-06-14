import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { HiringStage } from '../../types';
import { hiringStageStyles, nextStageMap } from '../../data';
import { ApplicationNotes } from './ApplicationNotes';

interface HiringProcessPanelProps {
  hiringStage: HiringStage;
  onRequestAdvance: () => void;
  onRequestDecline: () => void;
  disabled?: boolean;
}

export function HiringProcessPanel({
  hiringStage,
  onRequestAdvance,
  onRequestDecline,
  disabled = false,
}: HiringProcessPanelProps) {
  const nextStage = nextStageMap[hiringStage];
  const canReject = hiringStage !== 'Rejected';
  const canAdvance =
    !!nextStage &&
    hiringStage !== 'Rejected' &&
    hiringStage !== 'Withdrawn' &&
    hiringStage !== 'Offer';

  return (
    <View>
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
      <ApplicationNotes />
    </View>
  );
}
