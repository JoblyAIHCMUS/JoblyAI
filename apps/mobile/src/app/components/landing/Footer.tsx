import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Facebook, Instagram, Linkedin, Twitter, Dribbble } from 'lucide-react-native';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.container}>
      <Text style={styles.copyright}>
        {currentYear} @ JoblyAI. No rights reserved.
      </Text>
      
      <View style={styles.socials}>
        <TouchableOpacity style={styles.socialIcon}>
          <Facebook size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Instagram size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Dribbble size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Linkedin size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Twitter size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#0F172A', // Slate-900
    alignItems: 'center',
  },
  copyright: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 24,
  },
  socials: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Footer;
