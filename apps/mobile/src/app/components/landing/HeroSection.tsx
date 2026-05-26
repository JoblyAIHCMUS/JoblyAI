import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SPACING } from '../../constants/theme';
import { IconInput } from '../shared/IconInput';
import { AppButton } from '../shared/AppButton';
import {
  SearchIcon,
  PinIcon,
  ChevronIcon,
  SquigglyLines,
} from '../shared/svgs/Icons';

const handleNoop = (): void => {
  // No-op for handlers to satisfy ESLint
};

const HeroSection: React.FC = () => {
  return (
    <View style={styles.heroContainer} className="bg-app-background-1">
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} className="text-app-text-1">
            Discover more than{' '}
            <Text style={styles.highlightText} className="text-app-primary-1">5000+ Jobs</Text>
          </Text>
          <View style={styles.squigglyContainer}>
            <SquigglyLines />
          </View>
        </View>

        <Text style={styles.subheading} className="text-app-text-3">
          Great platform for the job seeker that searching for new career
          heights and passionate about startups.
        </Text>

        <View style={styles.searchCard} className="bg-app-white-1">
          <IconInput
            icon={<SearchIcon />}
            placeholder="Job title or keyword"
            value=""
            onChangeText={handleNoop}
          />
          <View style={styles.locationInputContainer}>
            <IconInput
              icon={<PinIcon />}
              placeholder="Florence, Italy"
              value=""
              onChangeText={handleNoop}
            />
            <View style={styles.chevronContainer}>
              <ChevronIcon />
            </View>
          </View>
          <AppButton title="Search my job" onPress={handleNoop} />
        </View>

        <View style={styles.popularTagsContainer}>
          <Text style={styles.popularText} className="text-app-text-3">
            Popular :{' '}
            <Text style={styles.tagsText}>
              UI Designer, UX Researcher, Android, Admin
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  content: {
    marginTop: SPACING.md,
  },
  titleContainer: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 48,
  },
  highlightText: {
  },
  squigglyContainer: {
    marginTop: SPACING.xs,
  },
  subheading: {
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  searchCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: SPACING.lg,
  },
  locationInputContainer: {
    position: 'relative',
  },
  chevronContainer: {
    position: 'absolute',
    right: 0,
    top: 12,
  },
  popularTagsContainer: {
    marginTop: SPACING.sm,
  },
  popularText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tagsText: {
    fontWeight: '400',
  },
});

export default HeroSection;
