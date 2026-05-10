import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Logo from '../../../assets/images/jobly-logo.svg';
import { COLORS, SPACING } from '../../constants/theme';

interface HeaderProps {
  onMenuPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress }) => {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Menu Icon Left */}
        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.7}
          onPress={onMenuPress}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 10H20M4 16H14"
              stroke={COLORS.text}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Logo and Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoContainer}>
            <Logo width={34} height={34} />
          </View>
          <Text style={styles.brandText}>JoblyAI</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8F9FE', // Matches the light blue-ish background in the image
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E6E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
  },
  brandText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#121419',
    letterSpacing: -0.5,
  },
});

export default Header;
