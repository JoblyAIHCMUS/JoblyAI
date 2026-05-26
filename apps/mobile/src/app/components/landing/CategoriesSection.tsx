import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SPACING } from '../../constants/theme';
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
    <View style={styles.container} className="bg-app-background-1">
      <View style={styles.header}>
        <Text style={styles.title} className="text-app-text-1">
          Explore by <Text style={styles.highlight} className="text-app-primary-1">category</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          className="text-app-primary-1"
          style={{ marginTop: SPACING.xl }}
        />
      ) : error ? (
        <Text className="text-app-red-1" style={{ marginTop: SPACING.md }}>
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
        <Text style={styles.showAllText} className="text-app-primary-1">Show all jobs</Text>
        <ArrowRightIconPrimary />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  highlight: {
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
  },
  grid: {
    marginTop: SPACING.md,
  },
});

export default CategoriesSection;
