import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants/theme';

export interface Category {
  name: string;
  jobs: number;
  icon: string;
  active?: boolean;
}

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
}

const CategoryIcon = ({ name, active }: { name: string; active?: boolean }) => {
  const color = active ? COLORS.white : COLORS.primary;
  
  switch (name) {
    case 'Paintbrush':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7.17V11h3.83l1.76-1.76a2 2 0 0 0 0-2.82L12 4.83l4.37-4.37a2.12 2.12 0 1 1 3 3Z" />
          <Path d="M13 8h2v2" />
          <Path d="M8 11v10h11v-10H8Z" />
        </Svg>
      );
    case 'BarChart3':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 3v18h18" />
          <Path d="M18 17V9" />
          <Path d="M13 17V5" />
          <Path d="M8 17v-3" />
        </Svg>
      );
    case 'Megaphone':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="m3 11 18-5v12L3 14v-3z" />
          <Path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </Svg>
      );
    case 'Wallet':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <Path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </Svg>
      );
    case 'Monitor':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M2 3h20v14H2z" />
          <Path d="M8 21h8" />
          <Path d="M12 17v4" />
        </Svg>
      );
    case 'Code':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="m18 16 4-4-4-4" />
          <Path d="m6 8-4 4 4 4" />
          <Path d="m14.5 4-5 16" />
        </Svg>
      );
    case 'Briefcase':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <Path d="M2 18h20" />
          <Path d="M2 6h20" />
          <Path d="M12 12v.01" />
        </Svg>
      );
    case 'Users':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <Path d="M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
      );
    default:
      return null;
  }
};

const ArrowRightIcon = ({ active }: { active?: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={active ? COLORS.white : COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Svg>
);

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const { name, jobs, icon, active } = category;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        active ? styles.activeCard : styles.inactiveCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
        <CategoryIcon name={icon} active={active} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.name, active && styles.activeText]}>{name}</Text>
        <View style={styles.jobsContainer}>
          <Text style={[styles.jobs, active && styles.activeTextLight]}>
            {jobs} jobs available
          </Text>
          <ArrowRightIcon active={active} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderRadius: 12,
    width: '100%',
    marginBottom: SPACING.md,
  },
  activeCard: {
    backgroundColor: COLORS.primary,
  },
  inactiveCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentContainer: {
    gap: SPACING.xs,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  jobsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobs: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  activeText: {
    color: COLORS.white,
  },
  activeTextLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
