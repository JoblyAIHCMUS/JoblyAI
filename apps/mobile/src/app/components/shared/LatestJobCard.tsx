import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Badge } from './Badge';

export interface LatestJobProps {
  title: string;
  company: string;
  location: string;
  type: string;
  tags: string[];
}

export const LatestJobCard = ({ title, company, location, type, tags }: LatestJobProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.logoPlaceholder} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.companyLocation}>
            {company} • {location}
          </Text>
          <View style={styles.tagsContainer}>
            <Badge 
              label={type} 
              color="#EBF9F1" 
              textColor="#56CDAD"
              outline
            />
            <View style={styles.separator} />
            {tags.map((tag, index) => {
              const getTagStyles = (t: string) => {
                const lowerTag = t.toLowerCase();
                if (lowerTag === 'marketing') return { textColor: '#FFB836', color: 'transparent' };
                if (lowerTag === 'design') return { textColor: '#4640DE', color: 'transparent' };
                if (lowerTag === 'developer') return { textColor: '#26A4FF', color: 'transparent' };
                if (lowerTag === 'management') return { textColor: '#B197FC', color: 'transparent' };
                return { textColor: COLORS.textLight, color: 'transparent' };
              };
              const { textColor, color } = getTagStyles(tag);
              return (
                <Badge 
                  key={index} 
                  label={tag} 
                  color={color} 
                  textColor={textColor}
                  outline
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  companyLocation: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
});
