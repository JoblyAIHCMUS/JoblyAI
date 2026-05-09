import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export const Badge = ({ label, color = COLORS.badgeGreen, textColor = COLORS.badgeGreenText, outline = false }) => (
  <View style={[
    styles.badge, 
    { 
      backgroundColor: color === 'transparent' ? 'transparent' : color, 
      borderColor: outline ? (color === 'transparent' ? textColor : color) : 'transparent', 
      borderWidth: outline ? 1 : 0 
    }
  ]}>
    <Text style={[styles.text, { color: textColor }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 80,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
