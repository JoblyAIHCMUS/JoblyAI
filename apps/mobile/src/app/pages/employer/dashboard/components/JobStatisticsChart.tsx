import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { MaterialIcons } from '@expo/vector-icons';
import { StatsDataSet } from '../utils/statsAggregation';

interface JobStatisticsChartProps {
  data?: StatsDataSet;
  loading?: boolean;
}

export const JobStatisticsChart = ({
  data = [],
  loading = false,
}: JobStatisticsChartProps) => {
  const screenWidth = Dimensions.get('window').width;
  const CHART_WIDTH = screenWidth - 32;
  const CHART_HEIGHT = 220;

  // Calculate max value dynamically or use a default
  const MAX_VALUE =
    Math.max(
      ...data.flatMap((item) =>
        item.stacks.reduce((acc, stack) => acc + stack.value, 0)
      ),
      10 // Minimum max value to prevent issues
    ) * 1.2; // Add 20% headroom

  const BAR_WIDTH = 34;
  const SPACING =
    data.length > 1
      ? (CHART_WIDTH - data.length * BAR_WIDTH) / (data.length - 1)
      : 0;

  return (
    <View className="px-4 py-8">
      {/* Header and Tabs */}
      <View className="flex-row justify-between mb-6" pointerEvents="box-none">
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            Job statistics
          </Text>
          <Text className="text-[#475569] text-base">
            Showing Job statistic (Past 7 days)
          </Text>
        </View>
        <TouchableOpacity className="border border-[#CBD5E1] rounded-md px-4 flex-row items-center justify-center bg-white self-stretch gap-x-1">
          <Text className="text-[#0F172A] font-medium text-base">Week</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      <View
        className="flex-row justify-between border-b border-gray-200 mb-8"
        pointerEvents="box-none"
      >
        <View className="border-b-2 border-indigo-600 pb-2">
          <Text className="text-indigo-600 font-semibold text-lg">
            Overview
          </Text>
        </View>
        <Text className="text-[#475569] pb-2 font-semibold text-lg">
          Jobs View
        </Text>
        <Text className="text-[#475569] pb-2 font-semibold text-lg">
          Jobs Applied
        </Text>
      </View>

      <View className="relative min-h-[220px] justify-center">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : data.length > 0 ? (
          <BarChart
            stackData={data}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            barWidth={BAR_WIDTH}
            spacing={SPACING}
            initialSpacing={0}
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            hideYAxisText
            yAxisLabelWidth={0}
            noOfSections={3}
            maxValue={MAX_VALUE}
            xAxisLabelTextStyle={{
              color: '#475569',
              fontSize: 16,
              textAlign: 'center',
              marginTop: 4,
            }}
            isAnimated
            disableScroll={true}
          />
        ) : (
          <View className="items-center justify-center h-[220px]">
            <Text className="text-gray-500">
              No data available for this period
            </Text>
          </View>
        )}

        <View className="flex-row mt-6 gap-x-6" pointerEvents="box-none">
          <View className="flex-row items-center gap-x-2">
            <View className="w-4 h-4 rounded bg-amber-500" />
            <Text className="text-[#475569] text-base">Job View</Text>
          </View>
          <View className="flex-row items-center gap-x-2">
            <View className="w-4 h-4 rounded bg-purple-500" />
            <Text className="text-[#475569] text-base">Job Applied</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
