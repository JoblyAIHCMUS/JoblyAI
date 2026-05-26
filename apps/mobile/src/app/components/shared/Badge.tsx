import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

export interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  outline?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = COLORS.badgeGreen,
  textColor = COLORS.badgeGreenText,
  outline = false,
}) => {
  const borderClasses = outline ? 'border' : '';

  return (
    <View
      className={`px-2 py-1 rounded-full self-start ${borderClasses}`}
      style={{
        backgroundColor: color === 'transparent' ? 'transparent' : color,
        borderColor: outline
          ? color === 'transparent'
            ? textColor
            : color
          : 'transparent',
      }}
    >
      <Text className="text-xs font-semibold" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
};
