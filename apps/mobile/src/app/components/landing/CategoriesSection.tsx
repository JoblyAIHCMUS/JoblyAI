import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { CategoryCard } from '../shared/CategoryCard';
import { ArrowRightIconPrimary } from '../shared/svgs/Icons';
import { usePopularCategories } from '../../../hooks/usePopularCategories';

// Helper to map category names to local icons
const getCategoryIcon = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('design')) return 'Paintbrush';
  if (normalized.includes('sale') || normalized.includes('chart'))
    return 'BarChart3';
  if (normalized.includes('marketing')) return 'Megaphone';
  if (normalized.includes('finance') || normalized.includes('money'))
    return 'Wallet';
  if (normalized.includes('tech') || normalized.includes('it'))
    return 'Monitor';
  if (
    normalized.includes('engineer') ||
    normalized.includes('code') ||
    normalized.includes('develop')
  )
    return 'Code';
  if (
    normalized.includes('human') ||
    normalized.includes('hr') ||
    normalized.includes('people')
  )
    return 'Users';
  return 'Briefcase'; // Fallback
};

export const CategoriesSection = () => {
  const { categories, loading, error } = usePopularCategories(8);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Explore by <Text style={styles.highlight}>category</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: SPACING.xl }}
        />
      ) : error ? (
        <Text style={{ color: COLORS.error, marginTop: SPACING.md }}>
          Failed to load categories.
        </Text>
      ) : (
        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id.toString()}
              category={{
                name: category.name,
                jobs: category.jobCount,
                icon: getCategoryIcon(category.name),
                active: false,
              }}
            />
          ))}
        </View>
      )}

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
