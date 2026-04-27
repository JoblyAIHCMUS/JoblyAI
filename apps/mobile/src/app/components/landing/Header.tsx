import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu } from 'lucide-react-native';

const Header = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton}>
        <Menu size={24} color="#0F172A" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          {/* Circular logo icon placeholder */}
          <View style={styles.innerCircle} />
        </View>
        <Text style={styles.logoText}>JoblyAI</Text>
      </View>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  placeholder: {
    width: 32, // To balance the menu button
  },
});

export default Header;
