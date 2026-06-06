import React from 'react';
import type { ComponentProps } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { StatsSummary } from '../utils/statsAggregation';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface DetailedStatCardsProps {
  summary?: StatsSummary;
  loading?: boolean;
}

export const DetailedStatCards = ({
  summary,
  loading,
}: DetailedStatCardsProps) => {
  const resolvedSummary = summary ?? {
    totalJobViews: 0,
    totalJobApplications: 0,
    jobViewsDiff: 0,
    jobApplicationsDiff: 0,
    periodLabel: 'This Week',
  };

  const renderStatCard = (
    title: string,
    total: number,
    diff: number | null,
    periodLabel: string,
    icon: FeatherIconName,
    iconBg: string
  ) => {
    const hasDiff = diff !== null;
    const diffValue = hasDiff ? (diff as number) : 0;
    const isPositive = hasDiff && diffValue >= 0;
    const diffColor = !hasDiff
      ? '#94A3B8'
      : isPositive
      ? '#22C55E'
      : '#EC4899';

    return (
      <View className="bg-white rounded-2xl p-5 border border-app-border-2 shadow-sm flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-xl font-bold text-app-slate-1 mb-2">
            {title}
          </Text>
          <View className="flex-row items-baseline gap-x-2">
            {loading ? (
              <ActivityIndicator size="small" color="#25324B" />
            ) : (
              <Text className="text-4xl font-extrabold text-app-text-4">
                {total.toLocaleString()}
              </Text>
            )}
            <View className="flex-row items-center gap-x-1">
              <Text className="text-app-text-5 text-base">{periodLabel}</Text>
              {!loading && hasDiff && (
                <>
                  <Text
                    style={{ color: diffColor }}
                    className="font-medium ml-1"
                  >
                    {Math.abs(diffValue)}%
                  </Text>
                  <MaterialIcons
                    name={isPositive ? 'arrow-drop-up' : 'arrow-drop-down'}
                    size={28}
                    color={diffColor}
                  />
                </>
              )}
              {!loading && !hasDiff && (
                <Text className="text-app-text-5 text-base ml-1">
                  —
                </Text>
              )}
            </View>
          </View>
        </View>
        <View
          className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center`}
        >
          <Feather name={icon} size={20} color="white" />
        </View>
      </View>
    );
  };

  return (
    <View className="px-4 gap-y-4">
      {renderStatCard(
        'Jobs View',
        resolvedSummary.totalJobViews,
        resolvedSummary.jobViewsDiff,
        resolvedSummary.periodLabel,
        'eye',
        'bg-app-amber-2'
      )}

      {renderStatCard(
        'Jobs Applied',
        resolvedSummary.totalJobApplications,
        resolvedSummary.jobApplicationsDiff,
        resolvedSummary.periodLabel,
        'clipboard',
        'bg-app-purple-1'
      )}
    </View>
  );
};
