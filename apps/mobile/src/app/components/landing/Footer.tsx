import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from '../shared/svgs/Icons';

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
  <TouchableOpacity className="bg-white/10 min-h-11 min-w-11 rounded-full items-center justify-center mx-1">
    {children}
  </TouchableOpacity>
);

const Footer = () => {
  return (
    <View className="bg-app-slate-1 py-8 px-4 items-center justify-center">
      <Text className="text-app-text-5 text-sm mb-6 text-center">
        2026 @ JoblyAI. No rights reserved.
      </Text>

      <View className="flex-row items-center justify-center">
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

export default Footer;
