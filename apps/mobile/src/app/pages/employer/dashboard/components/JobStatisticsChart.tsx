import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { MaterialIcons } from '@expo/vector-icons';
import { jobStatsStackData } from '../data/mockData';

export const JobStatisticsChart = () => {
  const screenWidth = Dimensions.get('window').width;
  const CHART_WIDTH = screenWidth - 32;
  const CHART_HEIGHT = 220;
  const MAX_VALUE = 200;
  const BAR_WIDTH = 34;
  const SPACING = (CHART_WIDTH - (7 * BAR_WIDTH)) / 6;

  return (
    <View className="px-4 py-8">
      {/* Header and Tabs */}
      <View className="flex-row justify-between mb-6" pointerEvents="box-none">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Job statistics</Text>
          <Text className="text-[#475569] text-base">Showing Job statistic Jul 19-25</Text>
        </View>
        <TouchableOpacity className="border border-[#CBD5E1] rounded-md px-4 flex-row items-center justify-center bg-white self-stretch gap-x-1">
          <Text className="text-[#0F172A] font-medium text-base">Week</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between border-b border-gray-200 mb-8" pointerEvents="box-none">
        <View className="border-b-2 border-indigo-600 pb-2">
          <Text className="text-indigo-600 font-semibold text-lg">Overview</Text>
        </View>
        <Text className="text-[#475569] pb-2 font-semibold text-lg">Jobs View</Text>
        <Text className="text-[#475569] pb-2 font-semibold text-lg">Jobs Applied</Text>
      </View>

      <View className="relative">
        <BarChart
          stackData={jobStatsStackData}
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
