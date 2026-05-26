import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING } from '../../constants/theme';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from '../shared/svgs/Icons';

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
  <TouchableOpacity style={styles.socialIconWrapper} className="bg-white/10">
    {children}
  </TouchableOpacity>
);

const Footer = () => {
  return (
    <View style={styles.container} className="bg-app-slate-1">
      <Text style={styles.copyrightText} className="text-app-text-5">
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
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyrightText: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
  },
});

export default Footer;
