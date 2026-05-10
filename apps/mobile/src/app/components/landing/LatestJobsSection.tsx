import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { LatestJobCard } from '../shared/LatestJobCard';
import { useListJobs } from '../../../hooks/useListJobs';

export const LatestJobsSection = () => {
  const { data, loading, error, fetchJobs } = useListJobs({ pageSize: 6 });

  // Helper to format employment type (e.g., FULL_TIME -> Full-Time)
  const formatType = (type: string) => {
    return type
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Latest <Text style={styles.highlight}>jobs open</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load jobs</Text>
          <TouchableOpacity
            onPress={() => fetchJobs()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {data?.jobs.map((job) => (
            <LatestJobCard
              key={job.id}
              title={job.title}
              company={job.company.name}
              logoUrl={job.company.logoUrl || undefined}
              location={job.location || (job.remote ? 'Remote' : 'On-site')}
              type={formatType(job.type)}
              tags={[
                job.category.name,
                ...(job.requirements?.[0]?.skillName
                  ? [job.requirements[0].skillName]
                  : []),
              ]}
            />
          ))}
        </View>
      )}
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
  list: {
    marginTop: SPACING.md,
  },
  loader: {
    marginVertical: SPACING.xl,
  },
  errorContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF4444',
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default LatestJobsSection;
