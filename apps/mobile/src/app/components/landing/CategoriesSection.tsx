import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { CATEGORIES } from '../../constants/mockData';
import { CategoryCard } from '../shared/CategoryCard';
import { ArrowRightIconPrimary } from '../shared/svgs/Icons';

export const CategoriesSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Explore by <Text style={styles.highlight}>category</Text>
        </Text>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </View>

      <TouchableOpacity style={styles.showAll} activeOpacity={0.7}>
        <Text style={styles.showAllText}>Show all jobs</Text>
        <ArrowRightIconPrimary />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  highlight: {
    color: COLORS.primary,
  },
  showAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  showAllText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  grid: {
    marginTop: SPACING.md,
  },
});

export default CategoriesSection;
