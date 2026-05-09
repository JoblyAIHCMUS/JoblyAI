import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Badge } from './Badge';

export interface FeaturedJobProps {
  title: string;
  company: string;
  location: string;
  tags: string[];
  description: string;
}

export const FeaturedJobCard = ({ title, company, location, tags, description }: FeaturedJobProps) => {
  const getTagColors = (tag: string) => {
    switch (tag) {
      case 'Marketing':
        return { color: COLORS.tagOrangeBg, textColor: COLORS.tagOrangeText };
      case 'Design':
        return { color: COLORS.tagGreenBg, textColor: COLORS.tagGreenText };
      default:
        return { color: '#F8F8FD', textColor: COLORS.badgeBlue };
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.logoPlaceholder} />
        <Badge label="Full Time" outline textColor={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.companyLocation}>
          {company} • {location}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => {
          const { color, textColor } = getTagColors(tag);
          return (
            <Badge 
              key={index} 
              label={tag} 
              color={color} 
              textColor={textColor}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    width: 280,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  content: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  companyLocation: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
});
