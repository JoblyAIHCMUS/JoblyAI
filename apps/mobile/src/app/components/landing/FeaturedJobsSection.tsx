import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';

const featuredJobs = [
  {
    title: 'Email Marketing',
    company: 'Revolut',
    location: 'Madrid, Spain',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Brand Designer',
    company: 'Dropbox',
    location: 'San Fransisco, US',
    tags: ['Design', 'Business'],
  },
  {
    title: 'Interactive Developer',
    company: 'Terraform',
    location: 'Hamburg, Germany',
    tags: ['Marketing', 'Design'],
  },
];

const FeaturedJobsSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          Featured <Text style={styles.highlight}>jobs</Text>
        </Text>
        <TouchableOpacity style={styles.showAllLink}>
          <Text style={styles.showAllText}>Show all jobs</Text>
          <ArrowRight size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={300}
      >
        {featuredJobs.map((job, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.logoPlaceholder} />
              <View style={styles.fullTimeBadge}>
                <Text style={styles.fullTimeText}>Full Time</Text>
              </View>
            </View>
            
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyInfo}>
              {job.company} • {job.location}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              Revolut is looking for Email Marketing to help team ma ...
            </Text>
            
            <View style={styles.tagsContainer}>
              {job.tags.map((tag, tagIndex) => (
                <View
                  key={tagIndex}
                  style={[
                    styles.tag,
                    tag === 'Design' ? styles.designTag : styles.marketingTag,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      tag === 'Design' ? styles.designTagText : styles.marketingTagText,
                    ]}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
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
  showAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  showAllText: {
    color: '#4F46E5',
    fontWeight: '600',
    marginRight: 4,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 280,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  fullTimeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 4,
  },
  fullTimeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  marketingTag: {
    backgroundColor: '#FFE4E6', // Rose-100
  },
  marketingTagText: {
    color: '#E11D48', // Rose-600
  },
  designTag: {
    backgroundColor: '#CCFBF1', // Teal-100
  },
  designTagText: {
    color: '#0D9488', // Teal-600
  },
});

export default FeaturedJobsSection;
