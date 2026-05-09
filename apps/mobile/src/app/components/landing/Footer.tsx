import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants/theme';

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
  <TouchableOpacity style={styles.socialIconWrapper}>
    {children}
  </TouchableOpacity>
);

const Footer = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.copyrightText}>2026 @ JoblyAI. No rights reserved.</Text>
      
      <View style={styles.socialContainer}>
        <SocialIcon>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
          </Svg>
        </SocialIcon>

        <SocialIcon>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <Circle cx="4" cy="4" r="2" />
          </Svg>
        </SocialIcon>

        <SocialIcon>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <Path d="M17.5 6.5h.01" />
          </Svg>
        </SocialIcon>

        <SocialIcon>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </Svg>
        </SocialIcon>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.text, // Dark #202430
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyrightText: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});

export default Footer;
