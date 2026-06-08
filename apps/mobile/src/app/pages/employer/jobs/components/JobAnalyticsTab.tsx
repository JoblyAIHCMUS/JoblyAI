import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useJobViewsAnalyticsForJob } from '../../../../../hooks/useJobViewsAnalyticsForJob';

type TimeMode = 'week' | 'month' | 'year';

interface JobAnalyticsTabProps {
  jobId: number;
  totalApplications: number;
}

function getRange(mode: TimeMode): {
  start: Date;
  end: Date;
  groupBy: 'day' | 'month';
} {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  if (mode === 'week') {
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end, groupBy: 'day' };
  }
  if (mode === 'month') {
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end, groupBy: 'day' };
  }
  const start = new Date(end.getFullYear(), 0, 1, 0, 0, 0, 0);
  return { start, end, groupBy: 'month' };
}

function buildChartData(
  series: { period: string; viewCount: number }[],
  start: Date,
  end: Date,
  groupBy: 'day' | 'month'
): { value: number; label: string }[] {
  const byPeriod = new Map(series.map((s) => [s.period, s.viewCount]));
  const out: { value: number; label: string }[] = [];

  if (groupBy === 'day') {
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
      const key = cursor.toISOString().split('T')[0];
      out.push({
        label: `${cursor.getDate()} ${cursor.toLocaleString('default', {
          month: 'short',
        })}`,
        value: byPeriod.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor.getTime() <= last.getTime()) {
      const key = cursor.toISOString().substring(0, 7);
      out.push({
        label: cursor.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        value: byPeriod.get(key) ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return out;
}

export default function JobAnalyticsTab({
  jobId,
  totalApplications,
}: JobAnalyticsTabProps) {
  const [timeMode, setTimeMode] = useState<TimeMode>('week');
  const [showDropdown, setShowDropdown] = useState(false);

  const { start, end, groupBy } = getRange(timeMode);
  const { data, isLoading, isError, refetch } = useJobViewsAnalyticsForJob(
    jobId,
    start,
    end,
    groupBy
  );

  const chartData = useMemo(
    () => (data ? buildChartData(data.series, start, end, groupBy) : []),
    [data, start, end, groupBy]
  );

  const maxValue = Math.max(...chartData.map((d) => d.value), 10) * 1.2;
  const screenWidth = Dimensions.get('window').width;
  const CHART_WIDTH = screenWidth - 32 - 40;

  // Calculate spacing to leave room at the edges for text labels
  const initialSpacing = 20;
  const endSpacing = 25;
  const spacing = chartData.length > 1
    ? (CHART_WIDTH - initialSpacing - endSpacing) / (chartData.length - 1)
    : 0;

  const groupByLabels: Record<TimeMode, string> = {
    week: 'Week',
    month: 'Month',
    year: 'Year',
  };

  const options: { label: string; value: TimeMode }[] = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  const renderStatCard = (
    title: string,
    total: number,
    iconName: React.ComponentProps<typeof Feather>['name'],
    iconBg: string
  ) => (
    <View className="bg-white rounded-2xl p-5 border border-app-border-2 shadow-sm flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-xl font-bold text-app-slate-1 mb-2">{title}</Text>
        <View className="flex-row items-baseline gap-x-2">
          {isLoading ? (
            <ActivityIndicator size="small" color="#25324B" />
          ) : (
            <Text className="text-4xl font-extrabold text-app-text-4">
              {total.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
      <View
        className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center`}
      >
        <Feather name={iconName} size={20} color="white" />
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1" contentContainerClassName="px-4 py-8 gap-y-6">
      <Text className="text-2xl font-bold text-gray-900">Job Analytics</Text>

      {/* Stat cards */}
      {renderStatCard('Total Views', data?.totalViews ?? 0, 'eye', 'bg-app-amber-2')}
      {renderStatCard('Total Applied', totalApplications, 'clipboard', 'bg-app-purple-1')}

      {/* Chart card */}
      <View className="bg-white rounded-2xl p-5 border border-app-border-2 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-app-slate-1">
            View trends
          </Text>
          <View className="relative">
            <TouchableOpacity
              onPress={() => setShowDropdown(true)}
              className="border border-[#CBD5E1] rounded-md px-4 flex-row items-center justify-center bg-white h-[44px] gap-x-1"
            >
              <Text className="text-[#0F172A] font-medium text-base">
                {groupByLabels[timeMode]}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="#475569"
              />
            </TouchableOpacity>
          </View>
        </View>

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
                    onPress={() => {
                      setTimeMode(option.value);
                      setShowDropdown(false);
                    }}
                    className={`px-4 py-3 border-b border-[#F1F5F9] last:border-b-0 ${
                      timeMode === option.value ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <Text
                      className={`text-base font-medium ${
                        timeMode === option.value
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

        <View className="relative min-h-[220px] justify-center">
          {isLoading ? (
            <ActivityIndicator size="large" color="#4F46E5" />
          ) : isError ? (
            <View className="items-center justify-center h-[220px] gap-y-2">
              <Text className="text-app-text-5">
                Couldn't load view stats.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  void refetch();
                }}
                className="border border-app-border-2 rounded-md px-4 py-2 bg-white"
              >
                <Text className="text-app-slate-1 font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <LineChart
              data={chartData}
              width={CHART_WIDTH}
              height={220}
              spacing={spacing}
              initialSpacing={initialSpacing}
              endSpacing={endSpacing}
              color="#F59E0B"
              thickness={3}
              startFillColor="#F59E0B"
              endFillColor="#F59E0B"
              startOpacity={0.4}
              endOpacity={0.1}
              dataPointsRadius={3}
              dataPointsColor="#F59E0B"
              dataPointsWidth={2}
              hideRules
              hideYAxisText
              xAxisThickness={0}
              yAxisThickness={0}
              xAxisLabelTextStyle={{
                color: '#475569',
                fontSize: 12,
                marginTop: 4,
              }}
              yAxisTextStyle={{ color: '#475569', fontSize: 12 }}
              noOfSections={4}
              maxValue={Math.ceil(maxValue)}
              isAnimated
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
