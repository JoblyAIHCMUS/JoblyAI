import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { MaterialIcons } from '@expo/vector-icons';
import { StatsDataSet } from '../utils/statsAggregation';

type TabName = 'Overview' | 'Jobs View' | 'Jobs Applied';

const tabs: TabName[] = ['Overview', 'Jobs View', 'Jobs Applied'];

interface JobStatisticsChartProps {
  data?: StatsDataSet;
  loading?: boolean;
  groupBy?: 'day' | 'week' | 'month';
  onGroupByChange?: (value: 'day' | 'week' | 'month') => void;
}

export const JobStatisticsChart = ({
  data = [],
  loading = false,
  groupBy = 'day',
  onGroupByChange,
}: JobStatisticsChartProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('Overview');

  const displayData: StatsDataSet =
    activeTab === 'Overview'
      ? data
      : data.map((item) => {
          const zeroColor = activeTab === 'Jobs View' ? '#A855F7' : '#F59E0B';
          return {
            ...item,
            stacks: item.stacks.map((stack) =>
              stack.color === zeroColor ? { ...stack, value: 0 } : stack
            ),
          };
        });

  const screenWidth = Dimensions.get('window').width;
  const CHART_WIDTH = screenWidth - 32;
  const CHART_HEIGHT = 220;

  // Calculate max value dynamically or use a default
  const MAX_VALUE =
    Math.max(
      ...displayData.flatMap((item) =>
        item.stacks.reduce((acc, stack) => acc + stack.value, 0)
      ),
      10 // Minimum max value to prevent issues
    ) * 1.2; // Add 20% headroom

  const BAR_WIDTH = groupBy === 'month' ? 20 : 34; // Narrower bars for monthly (12 items)
  const SPACING =
    data.length > 1
      ? (CHART_WIDTH - data.length * BAR_WIDTH) / (data.length - 1)
      : 0;

  const groupByLabels = {
    day: 'Week',
    week: 'Month',
    month: 'Year',
  };

  const options: { label: string; value: 'day' | 'week' | 'month' }[] = [
    { label: 'Week', value: 'day' },
    { label: 'Month', value: 'week' },
    { label: 'Year', value: 'month' },
  ];

  const handleOptionSelect = (value: 'day' | 'week' | 'month') => {
    onGroupByChange?.(value);
    setShowDropdown(false);
  };

  return (
    <View className="px-4 py-8">
      {/* Header and Tabs */}
      <View className="flex-row justify-between items-center mb-6" pointerEvents="box-none">
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            Job statistics
          </Text>

        </View>
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowDropdown(true)}
            className="border border-[#CBD5E1] rounded-md px-4 flex-row items-center justify-center bg-white h-[44px] gap-x-1"
          >
            <Text className="text-[#0F172A] font-medium text-base">
              {groupByLabels[groupBy]}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={24}
              color="#475569"
            />
          </TouchableOpacity>

          <Modal
            visible={showDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
              <View className="flex-1 bg-black/10 items-center justify-center">
                <View className="bg-white rounded-lg border border-[#CBD5E1] shadow-xl w-48 overflow-hidden">
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleOptionSelect(option.value)}
                      className={`px-4 py-3 border-b border-[#F1F5F9] last:border-b-0 ${
                        groupBy === option.value ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <Text
                        className={`text-base font-medium ${
                          groupBy === option.value
                            ? 'text-indigo-600'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </View>

      <View
        className="flex-row justify-between border-b border-gray-200 mb-8"
        pointerEvents="box-none"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return isActive ? (
            <View key={tab} className="border-b-2 border-indigo-600 pb-2">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab)}
              >
                <Text className="text-indigo-600 font-semibold text-lg">
                  {tab}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.85}
              onPress={() => setActiveTab(tab)}
              className="pb-2"
            >
              <Text className="text-[#475569] font-semibold text-lg">
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="relative min-h-[220px] justify-center">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : data.length > 0 ? (
          <BarChart
            stackData={displayData}
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
              fontSize: groupBy === 'month' ? 12 : 16,
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
          {activeTab !== 'Jobs Applied' && (
            <View className="flex-row items-center gap-x-2">
              <View className="w-4 h-4 rounded bg-amber-500" />
              <Text className="text-[#475569] text-base">Job View</Text>
            </View>
          )}
          {activeTab !== 'Jobs View' && (
            <View className="flex-row items-center gap-x-2">
              <View className="w-4 h-4 rounded bg-purple-500" />
              <Text className="text-[#475569] text-base">Job Applied</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
