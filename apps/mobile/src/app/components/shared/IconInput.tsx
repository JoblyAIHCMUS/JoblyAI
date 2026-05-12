import React, { ReactNode } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
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
    <TextInput
      style={styles.input}
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
  input: { flex: 1, fontSize: 16, color: COLORS.text },
});
