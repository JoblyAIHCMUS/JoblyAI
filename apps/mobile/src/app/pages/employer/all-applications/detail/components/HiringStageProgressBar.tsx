import React from 'react';
import { View } from 'react-native';

import { HiringStage } from '../../types';
import { hiringStageColor, hiringStageProgress } from '../../data';

interface HiringStageProgressBarProps {
  hiringStage: HiringStage;
}

export function HiringStageProgressBar({
  hiringStage,
}: HiringStageProgressBarProps) {
  const progress = hiringStageProgress[hiringStage];
  const colorClass = hiringStageColor[hiringStage];

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ now: progress, min: 0, max: 100 }}
      accessibilityLabel={`Hiring progress: ${progress}%`}
      className="h-1.5 w-full rounded-full bg-app-gray-1 overflow-hidden"
    >
      <View
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${progress}%` }}
      />
    </View>
  );
}
