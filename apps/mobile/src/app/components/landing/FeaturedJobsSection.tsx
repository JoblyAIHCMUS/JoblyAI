import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { FeaturedJobCard } from '../shared/FeaturedJobCard';
import { ArrowRightIconPrimary } from '../shared/svgs/Icons';
import { useListJobs } from '../../../hooks/useListJobs';

export const FeaturedJobsSection = () => {
  const { data, loading, error, fetchJobs } = useListJobs({ pageSize: 4 });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Featured <Text style={styles.highlight}>jobs</Text>
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load featured jobs</Text>
          <TouchableOpacity
            onPress={() => fetchJobs()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {data?.jobs.map((job) => (
              <FeaturedJobCard
                key={job.id}
                title={job.title}
                company={job.company.name}
                location={job.location || (job.remote ? 'Remote' : 'On-site')}
                description={job.description}
                logoUrl={job.company.logoUrl || undefined}
                tags={job.requirements.slice(0, 2).map((r) => r.skillName)}
              />
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.showAll} activeOpacity={0.7}>
            <Text style={styles.showAllText}>Show all jobs</Text>
            <ArrowRightIconPrimary />
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  highlight: {
    color: COLORS.primary,
  },
  centerContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
  showAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  showAllText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg - SPACING.md, // Adjust for card marginRight
  },
});

export default FeaturedJobsSection;
