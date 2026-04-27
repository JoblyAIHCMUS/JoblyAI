import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VodafoneLogo from '../../../assets/landing/vodafone-logo.svg';
import IntelLogo from '../../../assets/landing/intel-logo.svg';
import TeslaLogo from '../../../assets/landing/tesla-logo.svg';
import AMDLogo from '../../../assets/landing/amd-logo.svg';
import TalkItLogo from '../../../assets/landing/talkit-logo.svg';

const CompaniesSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Companies we helped grow</Text>
      <View style={styles.logoGrid}>
        <View style={styles.logoItem}>
          <VodafoneLogo width={120} height={30} />
        </View>
        <View style={styles.logoItem}>
          <IntelLogo width={70} height={25} />
        </View>
        <View style={styles.logoItem}>
          <TalkItLogo width={90} height={25} />
        </View>
        <View style={styles.logoItem}>
          <AMDLogo width={100} height={25} />
        </View>
        <View style={styles.logoItem}>
          <TeslaLogo width={140} height={20} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 24,
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoItem: {
    width: '48%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.6,
  },
});

export default CompaniesSection;
