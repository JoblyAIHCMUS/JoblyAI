import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from '../shared/svgs/Icons';

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
  <TouchableOpacity style={styles.socialIconWrapper}>
    {children}
  </TouchableOpacity>
);

const Footer = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.copyrightText}>
        2026 @ JoblyAI. No rights reserved.
      </Text>

      <View style={styles.socialContainer}>
        <SocialIcon>
          <FacebookIcon />
        </SocialIcon>

        <SocialIcon>
          <InstagramIcon />
        </SocialIcon>

        <SocialIcon>
          <LinkedInIcon />
        </SocialIcon>

        <SocialIcon>
          <TwitterIcon />
        </SocialIcon>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.footerBg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyrightText: {
    color: COLORS.footerText,
    fontSize: 14,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
  },
});

export default Footer;
