import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../../components/ui/input';
import { COLORS, SPACING } from '../../constants/theme';

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
  <View style={styles.container}>
    <View style={styles.iconContainer}>{icon}</View>
    <Input
      className={styles.inputClassName}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={COLORS.textLight}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconContainer: { marginRight: SPACING.sm },
  inputClassName:
    'flex-1 border-0 bg-transparent px-0 text-base text-black shadow-none',
});
