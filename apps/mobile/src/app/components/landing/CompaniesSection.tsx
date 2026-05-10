import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import {
  VodafoneLogo,
  IntelLogo,
  TeslaLogo,
  AmdLogo,
  TalkitLogo,
} from '../shared/svgs/Icons';

const { width } = Dimensions.get('window');

export const CompaniesSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Companies we helped grow</Text>
      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.logoItem}>
            <VodafoneLogo />
          </View>
          <View style={styles.logoItem}>
            <IntelLogo />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.logoItem}>
            <TalkitLogo />
          </View>
          <View style={styles.logoItem}>
            <AmdLogo />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.logoItem}>
            <TeslaLogo />
          </View>
          <View style={styles.logoItem} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoItem: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFullWidth: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
});

export default CompaniesSection;
