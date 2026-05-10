import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { CategoryIcon, ArrowRightIcon } from './svgs/Icons';

export interface Category {
  name: string;
  jobs: number;
  icon: string;
  active?: boolean;
}

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
}

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const { name, jobs, icon, active } = category;

  return (
    <TouchableOpacity
      style={[styles.card, active ? styles.cardActive : styles.cardInactive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <CategoryIcon name={icon} active={active} />
      </View>

      <View style={styles.middleContainer}>
        <Text style={[styles.name, active && styles.textActive]}>{name}</Text>
        <Text style={[styles.jobs, active && styles.textActiveLight]}>
          {jobs} {jobs === 1 ? 'job' : 'jobs'} available
        </Text>
      </View>

      <View style={styles.rightContainer}>
        <ArrowRightIcon active={active} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  cardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  leftContainer: {
    marginRight: SPACING.md,
  },
  middleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  jobs: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  textActive: {
    color: COLORS.white,
  },
  textActiveLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rightContainer: {
    marginLeft: SPACING.md,
  },
});
