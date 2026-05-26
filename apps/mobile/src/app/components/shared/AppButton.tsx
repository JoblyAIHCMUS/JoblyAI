import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  style,
}: AppButtonProps) => {
  const baseClasses = 'py-4 rounded-lg items-center justify-center';
  const variantClasses =
    variant === 'primary' ? 'bg-app-primary-1' : 'border border-app-primary-1';

  const outlineStyle = variant === 'outline' ? { borderWidth: 1.5 } : {};

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses}`}
      style={[outlineStyle, style]}
      onPress={onPress}
    >
      <Text
        className={
          variant === 'primary'
            ? 'text-white text-base font-bold'
            : 'text-app-primary-1 text-base font-bold'
        }
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
