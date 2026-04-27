import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Paintbrush,
  BarChart3,
  Megaphone,
  Wallet,
  Monitor,
  Code,
  Briefcase,
  Users,
  ArrowRight,
} from 'lucide-react-native';

const categories = [
  { name: 'Design', jobs: 235, icon: Paintbrush },
  { name: 'Sales', jobs: 756, icon: BarChart3 },
  { name: 'Marketing', jobs: 140, icon: Megaphone, active: true },
  { name: 'Finance', jobs: 325, icon: Wallet },
  { name: 'Technology', jobs: 436, icon: Monitor },
  { name: 'Engineering', jobs: 542, icon: Code },
  { name: 'Business', jobs: 211, icon: Briefcase },
  { name: 'Human Resource', jobs: 346, icon: Users },
];

const CategoriesSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          Explore by <Text style={styles.highlight}>category</Text>
        </Text>
      </View>

      <View style={styles.list}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, cat.active && styles.activeCard]}
          >
            <View
              style={[
                styles.iconContainer,
                cat.active && styles.activeIconContainer,
              ]}
            >
              <cat.icon size={24} color={cat.active ? '#FFFFFF' : '#4F46E5'} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, cat.active && styles.activeText]}>
                {cat.name}
              </Text>
              <View style={styles.jobCountContainer}>
                <Text
                  style={[styles.jobCount, cat.active && styles.activeSubtext]}
                >
                  {cat.jobs} jobs available
                </Text>
                <ArrowRight
                  size={20}
                  color={cat.active ? '#FFFFFF' : '#4F46E5'}
                  style={styles.arrow}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.showAllButton}>
        <Text style={styles.showAllText}>Show all jobs</Text>
        <ArrowRight size={20} color="#4F46E5" style={styles.showAllArrow} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  highlight: {
    color: '#4F46E5',
  },
  list: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  activeCard: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  jobCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobCount: {
    fontSize: 16,
    color: '#64748B',
  },
  activeText: {
    color: '#FFFFFF',
  },
  activeSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  arrow: {
    marginLeft: 8,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  showAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 8,
  },
  showAllArrow: {
    marginTop: 2,
  },
});

export default CategoriesSection;
