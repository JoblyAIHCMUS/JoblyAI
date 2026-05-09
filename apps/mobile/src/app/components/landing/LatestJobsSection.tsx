import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants/theme';
import { LATEST_JOBS } from '../../constants/mockData';
import { LatestJobCard } from '../shared/LatestJobCard';

const ArrowRightIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Svg>
);

export const LatestJobsSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Latest <Text style={styles.highlight}>jobs open</Text>
        </Text>
        <TouchableOpacity style={styles.showAll} activeOpacity={0.7}>
          <Text style={styles.showAllText}>Show all jobs</Text>
          <ArrowRightIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        {LATEST_JOBS.map((job, index) => (
          <LatestJobCard key={index} {...job} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
  },
  showAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  list: {
    marginTop: SPACING.md,
  },
});

export default LatestJobsSection;
