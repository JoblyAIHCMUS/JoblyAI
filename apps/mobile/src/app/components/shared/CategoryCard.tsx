import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { CategoryIcon, ArrowRightIcon } from './svgs/Icons';

export interface Category {
  name: string;
  jobs: number;
  icon: string;
}

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
}

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const { name, jobs, icon } = category;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <CategoryIcon name={icon} />
      </View>
      
      <View style={styles.middleContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.jobs}>
          {jobs} {jobs === 1 ? 'job' : 'jobs'} available
        </Text>
      </View>

      <View style={styles.rightContainer}>
        <ArrowRightIcon />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
  rightContainer: {
    marginLeft: SPACING.md,
  },
});
