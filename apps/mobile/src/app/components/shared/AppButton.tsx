import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}

export const AppButton = ({
  title,
  onPress,
  variant = 'primary',
}: AppButtonProps) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'outline' ? styles.outline : styles.primary,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.text,
        variant === 'outline' ? styles.textOutline : styles.textPrimary,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: COLORS.primary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: { fontWeight: '700', fontSize: 16, fontFamily: 'Inter' },
  textPrimary: { color: COLORS.white },
  textOutline: { color: COLORS.primary },
});
