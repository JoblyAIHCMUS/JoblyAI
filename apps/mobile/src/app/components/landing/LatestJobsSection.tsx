import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { LATEST_JOBS } from '../../constants/mockData';
import { LatestJobCard } from '../shared/LatestJobCard';

export const LatestJobsSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Latest <Text style={styles.highlight}>jobs open</Text>
        </Text>
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
  list: {
    marginTop: SPACING.md,
  },
});

export default LatestJobsSection;
