import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const COMPANIES = ['Vodafone', 'Intel', 'Talkit', 'AMD', 'Tesla'];

export const CompaniesSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Companies we helped grow</Text>
      <View style={styles.grid}>
        {COMPANIES.map((company) => (
          <View key={company} style={styles.companyItem}>
            <Text style={styles.companyText}>{company}</Text>
          </View>
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
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  companyItem: {
    opacity: 0.5,
    marginVertical: SPACING.xs,
  },
  companyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
});

export default CompaniesSection;
