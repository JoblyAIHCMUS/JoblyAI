import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { jobStatsStackData } from '../data/mockData';

export const JobStatisticsChart = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <Pressable className="px-4 py-8" onPress={() => setSelectedIndex(null)}>
      <View className="flex-row justify-between items-end mb-6">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Job statistics</Text>
          <Text className="text-gray-500">Showing Jobstatistic Jul 19-25</Text>
        </View>
        <TouchableOpacity className="border border-gray-200 rounded-lg px-3 py-1">
          <Text className="text-gray-700">Week ⌄</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-x-6 border-b border-gray-200 mb-8">
        <View className="border-b-2 border-indigo-600 pb-2">
          <Text className="text-indigo-600 font-bold">Overview</Text>
        </View>
        <Text className="text-gray-500 pb-2">Jobs View</Text>
        <Text className="text-gray-500 pb-2">Jobs Applied</Text>
      </View>

      <View className="items-center">
        <BarChart
          stackData={jobStatsStackData}
          width={Dimensions.get('window').width - 60}
          height={200}
          barWidth={22}
          spacing={16}
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          hideYAxisText
          noOfSections={3}
          maxValue={200}
          onPress={(_, index) => setSelectedIndex(index)}
          renderStackTooltip={(item, index) => {
            if (index !== selectedIndex) return null;
            return (
              <View className="bg-slate-800 rounded-lg p-3 mb-2 items-center min-w-[80px]">
                <View className="flex-row items-center gap-x-2 mb-1">
                  <View className="w-2 h-2 rounded-sm bg-amber-500" />
                  <Text className="text-white font-bold text-xs">{item.stacks[1].value}</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <View className="w-2 h-2 rounded-sm bg-purple-500" />
                  <Text className="text-white font-bold text-xs">{item.stacks[0].value}</Text>
                </View>
                {/* Tooltip Tail */}
                <View 
                  className="absolute -bottom-1 w-2 h-2 bg-slate-800 rotate-45" 
                  style={{ left: '50%', marginLeft: -4 }} 
                />
              </View>
            );
          }}
          leftShiftForTooltip={10}
        />
        
        <View className="flex-row justify-center mt-6 gap-x-6">
          <View className="flex-row items-center gap-x-2">
            <View className="w-3 h-3 rounded bg-amber-500" />
            <Text className="text-gray-600">Job View</Text>
          </View>
          <View className="flex-row items-center gap-x-2">
            <View className="w-3 h-3 rounded bg-purple-500" />
            <Text className="text-gray-600">Job Applied</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};