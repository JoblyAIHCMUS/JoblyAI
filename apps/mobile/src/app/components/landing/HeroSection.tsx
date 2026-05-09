import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants/theme';
import { IconInput } from '../shared/IconInput';
import { AppButton } from '../shared/AppButton';

const { width } = Dimensions.get('window');

const SearchIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke={COLORS.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 21L16.65 16.65"
      stroke={COLORS.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PinIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
      stroke={COLORS.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
      stroke={COLORS.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={COLORS.textLight}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeroSection = () => {
  return (
    <View style={styles.heroContainer}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Discover more than{' '}
            <Text style={styles.highlightText}>5000+ Jobs</Text>
          </Text>
          <View style={styles.squigglyContainer}>
            <Svg height={10} width={150} viewBox="0 0 200 10">
              <Path
                d="M0 5 Q 50 0, 100 5 T 200 5"
                fill="none"
                stroke={COLORS.primary}
                strokeWidth={4}
              />
            </Svg>
          </View>
        </View>

        <Text style={styles.subheading}>
          Great platform for the job seeker that searching for new career heights and passionate about startups.
        </Text>

        <View style={styles.searchCard}>
          <IconInput
            icon={<SearchIcon />}
            placeholder="Job title or keyword"
            value=""
            onChangeText={() => {}}
          />
          <View style={styles.locationInputContainer}>
            <IconInput
              icon={<PinIcon />}
              placeholder="Florence, Italy"
              value=""
              onChangeText={() => {}}
            />
            <View style={styles.chevronContainer}>
              <ChevronIcon />
            </View>
          </View>
          <AppButton
            title="Search my job"
            onPress={() => {}}
          />
        </View>

        <View style={styles.popularTagsContainer}>
          <Text style={styles.popularText}>
            Popular : <Text style={styles.tagsText}>UI Designer, UX Researcher, Android, Admin</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    backgroundColor: COLORS.background,
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 40,
  },
  highlightText: {
    color: COLORS.primary,
  },
  squigglyContainer: {
    marginTop: -5,
    marginLeft: 120, // Adjust based on where "5000+ Jobs" starts
  },
  subheading: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  searchCard: {
    backgroundColor: COLORS.white,
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
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  tagsText: {
    fontWeight: '400',
  },
});

export default HeroSection;
