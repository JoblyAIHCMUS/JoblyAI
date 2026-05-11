import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { useTopCompanies } from '../../../hooks';

const { width } = Dimensions.get('window');

export const CompaniesSection = () => {
  const { companies, loading, error } = useTopCompanies(5);

  if (loading || error || companies.length === 0) {
    return null; // or a loading skeleton
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Companies we helped grow</Text>
      <View style={styles.grid}>
        <View style={styles.row}>
          {companies.map((company) => (
            <View key={company.id} style={styles.logoItem}>
              {company.logoUrl ? (
                <Image
                  source={{ uri: company.logoUrl }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.fallbackLogo}>
                  <Text style={styles.fallbackText}>
                    {company.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.brandDark,
    marginBottom: SPACING.lg,
  },
  grid: {
    rowGap: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoItem: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  fallbackLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.brandDark,
  },
});

export default CompaniesSection;
