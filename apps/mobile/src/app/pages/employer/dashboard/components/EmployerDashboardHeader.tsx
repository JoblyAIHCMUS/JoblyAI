import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';

interface EmployerDashboardHeaderProps {
  onMenuPress?: () => void;
}

const EmployerDashboardHeader: React.FC<EmployerDashboardHeaderProps> = ({
  onMenuPress,
}) => {
  return (
    <SafeAreaView edges={['top']} className="border-b border-[#CBD5E1]">
      <View className="h-16 flex-row items-center justify-between px-4">
        {/* Menu Icon Left */}
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-white border border-[#E6E8F0] items-center justify-center"
          activeOpacity={0.7}
          onPress={onMenuPress}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 10H20M4 16H14"
              stroke={COLORS.text}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Center Company Info */}
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: '#2DD4BF20' }}
          >
            <View
              className="w-6 h-6 rounded-md"
              style={{ backgroundColor: '#2DD4BF' }}
            />
          </View>
          <View>
            <Text className="text-[#475569] text-base">Company</Text>
            <Text className="text-[#0F172A] text-lg font-semibold -mt-1">
              Nomad
            </Text>
          </View>
        </View>

        {/* Notification Bell Right */}
        <TouchableOpacity
          className="w-11 h-11 items-center justify-center"
          activeOpacity={0.7}
        >
          <View>
            <Feather name="bell" size={24} color="#202430" />
            <View className="absolute top-0 right-0 w-3 h-3 bg-[#EF4444] rounded-full border-2 border-white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmployerDashboardHeader;
