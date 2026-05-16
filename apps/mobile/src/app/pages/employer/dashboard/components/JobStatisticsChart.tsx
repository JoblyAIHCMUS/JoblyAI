import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { jobStatsStackData } from '../data/mockData';

export const JobStatisticsChart = () => {
  const screenWidth = Dimensions.get('window').width;
  const CHART_HEIGHT = 220;
  const MAX_VALUE = 200;
  const BAR_WIDTH = 34;
  const SPACING = (screenWidth - 32 - (7 * BAR_WIDTH) - 20) / 6;

  return (
    <View className="px-4 py-8">
      {/* Header and Tabs */}
      <View className="flex-row justify-between items-end mb-6" pointerEvents="box-none">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Job statistics</Text>
          <Text className="text-gray-500">Showing Jobstatistic Jul 19-25</Text>
        </View>
        <TouchableOpacity className="border border-gray-200 rounded-lg px-3 py-1 bg-white">
          <Text className="text-gray-700">Week ⌄</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-x-6 border-b border-gray-200 mb-8" pointerEvents="box-none">
        <View className="border-b-2 border-indigo-600 pb-2">
          <Text className="text-indigo-600 font-bold">Overview</Text>
        </View>
        <Text className="text-gray-500 pb-2">Jobs View</Text>
        <Text className="text-gray-500 pb-2">Jobs Applied</Text>
      </View>

      <View className="relative">
        <BarChart
          stackData={jobStatsStackData}
          width={screenWidth - 32}
          height={CHART_HEIGHT}
          barWidth={BAR_WIDTH}
          spacing={SPACING}
          initialSpacing={10}
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          hideYAxisText
          noOfSections={3}
          maxValue={MAX_VALUE}
          xAxisLabelTextStyle={{
            color: '#6B7280',
            fontSize: 13,
            textAlign: 'center',
            marginTop: 4,
          }}
          isAnimated
        />
        
        <View className="flex-row mt-6 gap-x-6" pointerEvents="box-none">
          <View className="flex-row items-center gap-x-2">
            <View className="w-3 h-3 rounded bg-amber-500" />
            <Text className="text-gray-500">Job View</Text>
          </View>
          <View className="flex-row items-center gap-x-2">
            <View className="w-3 h-3 rounded bg-purple-500" />
            <Text className="text-gray-500">Job Applied</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
