import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Logo from '../../../assets/images/jobly-logo.svg';
import { COLORS } from '../../constants/theme';

interface HeaderProps {
  onMenuPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress }) => {
  return (
    <SafeAreaView
      edges={['top']}
      className="bg-app-background-2 border-b border-black/5"
    >
      <View className="h-16 flex-row items-center px-4">
        {/* Menu Icon Left */}
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-app-white-1 border border-app-border-3 items-center justify-center mr-4"
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

        {/* Logo and Brand */}
        <View className="flex-row items-center gap-2.5">
          <View className="w-[34px] h-[34px] rounded-full overflow-hidden">
            <Logo width={34} height={34} />
          </View>
          <Text className="text-2xl font-black text-app-brand-text tracking-tight">
            JoblyAI
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
