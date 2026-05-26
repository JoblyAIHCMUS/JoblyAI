import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { Input } from '../../../components/ui/input';
import { COLORS } from '../../constants/theme';

interface IconInputProps {
  icon: ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const IconInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
}: IconInputProps) => (
  <View className="flex-row items-center border-b border-app-border-3 py-2 mb-4">
    <View className="mr-2">{icon}</View>
    <Input
      className="flex-1 border-0 bg-transparent px-0 text-base text-black shadow-none"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={COLORS.textLight}
    />
  </View>
);

export default IconInput;
