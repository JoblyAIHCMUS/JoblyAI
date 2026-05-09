import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants/theme';
import { FEATURED_JOBS } from '../../constants/mockData';
import { FeaturedJobCard } from '../shared/FeaturedJobCard';

const ArrowRightIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Svg>
);

export const FeaturedJobsSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Featured <Text style={styles.highlight}>jobs</Text>
        </Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FEATURED_JOBS.map((job, index) => (
          <FeaturedJobCard key={index} {...job} />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.showAll} activeOpacity={0.7}>
        <Text style={styles.showAllText}>Show all jobs</Text>
        <ArrowRightIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  highlight: {
    color: COLORS.primary,
  },
  showAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  showAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg - SPACING.md, // Adjust for card marginRight
  },
});

export default FeaturedJobsSection;
