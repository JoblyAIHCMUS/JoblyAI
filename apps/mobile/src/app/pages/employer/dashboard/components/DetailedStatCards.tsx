import React from 'react';
import type { ComponentProps } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { StatsSummary } from '../utils/statsAggregation';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
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
    diff: number,
    periodLabel: string,
    icon: FeatherIconName,
    iconBg: string
  ) => {
    const isPositive = diff >= 0;
    const diffColor = isPositive ? '#22C55E' : '#EC4899';
    const arrowIcon: MaterialIconName = isPositive
      ? 'arrow-drop-up'
      : 'arrow-drop-down';

    return (
      <View className="bg-white rounded-2xl p-5 border border-[#CBD5E1] shadow-sm flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-xl font-bold text-[#0F172A] mb-2">{title}</Text>
          <View className="flex-row items-baseline gap-x-2">
            {loading ? (
              <ActivityIndicator size="small" color="#25324B" />
            ) : (
              <Text className="text-4xl font-extrabold text-[#25324B]">
                {total.toLocaleString()}
              </Text>
            )}
            <View className="flex-row items-center gap-x-1">
              <Text className="text-[#64748B] text-base">{periodLabel}</Text>
              {!loading && (
                <>
                  <Text
                    style={{ color: diffColor }}
                    className="font-medium ml-1"
                  >
                    {Math.abs(diff)}%
                  </Text>
                  <MaterialIcons name={arrowIcon} size={28} color={diffColor} />
                </>
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
        'Job Views',
        resolvedSummary.totalJobViews,
        resolvedSummary.jobViewsDiff,
        resolvedSummary.periodLabel,
        'eye',
        'bg-[#F59E0B]'
      )}

      {renderStatCard(
        'Job Applied',
        resolvedSummary.totalJobApplications,
        resolvedSummary.jobApplicationsDiff,
        resolvedSummary.periodLabel,
        'clipboard',
        'bg-[#A855F7]'
      )}
    </View>
  );
};
