import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants/theme';

export interface Category {
  name: string;
  jobs: number;
  icon: string;
}

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
}

const CategoryIcon = ({ name }: { name: string }) => {
  const color = COLORS.primary;
  
  switch (name) {
    case 'Paintbrush': // Design
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 19l7-7 3 3-7 7-3-3z" />
          <Path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <Path d="M2 2l7.586 7.586" />
          <Circle cx="11" cy="11" r="2" />
        </Svg>
      );
    case 'BarChart3': // Sales
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18 20V10" />
          <Path d="M12 20V4" />
          <Path d="M6 20v-6" />
        </Svg>
      );
    case 'Megaphone': // Marketing
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 11l18-5v12L3 14v-3z" />
          <Path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
        </Svg>
      );
    case 'Wallet': // Finance
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 12V7H5a2 2 0 010-4h14v4" />
          <Path d="M3 5v14a2 2 0 002 2h16v-5" />
          <Path d="M18 12a2 2 0 000 4h4v-4Z" />
        </Svg>
      );
    case 'Monitor': // Technology
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect width="20" height="14" x="2" y="3" rx="2" />
          <Path d="M8 21h8" />
          <Path d="M12 17v4" />
        </Svg>
      );
    case 'Code': // Engineering
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M16 18l6-6-6-6" />
          <Path d="M8 6l-6 6 6 6" />
          <Path d="M14.5 4l-5 16" />
        </Svg>
      );
    case 'Briefcase': // Business
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect width="20" height="14" x="2" y="7" rx="2" />
          <Path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </Svg>
      );
    case 'Users': // Human Resources
      return (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M22 21v-2a4 4 0 00-3-3.87" />
          <Path d="M16 3.13a4 4 0 010 7.75" />
        </Svg>
      );
    default:
      return null;
  }
};

const ArrowRightIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Svg>
);

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const { name, jobs, icon } = category;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <CategoryIcon name={icon} />
      </View>
      
      <View style={styles.middleContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.jobs}>
          {jobs} {jobs === 1 ? 'job' : 'jobs'} available
        </Text>
      </View>

      <View style={styles.rightContainer}>
        <ArrowRightIcon />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 8,
    width: '100%',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leftContainer: {
    marginRight: SPACING.md,
  },
  middleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  jobs: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  rightContainer: {
    marginLeft: SPACING.md,
  },
});
