import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search, MapPin, ChevronDown } from 'lucide-react-native';
import PatternSVG from '../../../assets/landing/Pattern.svg';
import GroupSVG from '../../../assets/landing/Group.svg';

const { width } = Dimensions.get('window');

const HeroSection = () => {
  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.patternContainer}>
        <PatternSVG width={width} height={width * 0.7} style={styles.pattern} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Discover more than <Text style={styles.highlight}>5000+ Jobs</Text>
        </Text>

        <View style={styles.groupContainer}>
          <GroupSVG width={width * 0.8} height={20} />
        </View>

        <Text style={styles.subtitle}>
          Great platform for the job seeker that searching for new career
          heights and passionate about startups.
        </Text>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.inputWrapper}>
            <Search size={24} color="#0F172A" />
            <TextInput
              style={styles.input}
              placeholder="Job title or keyword"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={[styles.inputWrapper, styles.borderTop]}>
            <MapPin size={24} color="#0F172A" />
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Florence, Italy</Text>
              <ChevronDown size={20} color="#0F172A" />
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search my job</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.popularText}>
          <Text style={styles.popularLabel}>Popular : </Text>
          UI Designer, UX Researcher, Android, Admin
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC', // Slate-50 equivalent
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  patternContainer: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    opacity: 0.5,
  },
  pattern: {
    transform: [{ rotate: '0deg' }],
  },
  content: {
    zIndex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 48,
    marginBottom: 10,
  },
  highlight: {
    color: '#4F46E5', // Indigo-600
  },
  groupContainer: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    lineHeight: 28,
    marginBottom: 32,
    opacity: 0.8,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#0F172A',
  },
  searchButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  popularText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  popularLabel: {
    fontWeight: '600',
  },
});

export default HeroSection;
