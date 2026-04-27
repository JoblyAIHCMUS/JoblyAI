import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.container}>
      <Text style={styles.copyright}>
        {currentYear} @ JoblyAI. No rights reserved.
      </Text>
      
      <View style={styles.socials}>
        <TouchableOpacity style={styles.socialIcon}>
          <Icon name="facebook" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Icon name="instagram" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Icon name="share-variant" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Icon name="linkedin" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIcon}>
          <Icon name="twitter" size={18} color="#FFFFFF" />
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
