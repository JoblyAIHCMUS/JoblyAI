import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

const latestJobs = [
  {
    title: 'Social Media Assistant',
    company: 'Nomad',
    location: 'Paris, France',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Brand Designer',
    company: 'Dropbox',
    location: 'San Fransisco, USA',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Interactive Developer',
    company: 'Terraform',
    location: 'Hamburg, Germany',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'HR Manager',
    company: 'Packer',
    location: 'Lucern, Switzerland',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Social Media Assistant',
    company: 'Netlify',
    location: 'Paris, France',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Brand Designer',
    company: 'Maze',
    location: 'San Fransisco, USA',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
];

const LatestJobsSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          Latest <Text style={styles.highlight}>jobs open</Text>
        </Text>
      </View>

      <View style={styles.list}>
        {latestJobs.map((job, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <View style={styles.logoPlaceholder} />
            <View style={styles.cardContent}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.companyInfo}>
                {job.company} • {job.location}
              </Text>
              <View style={styles.tagsContainer}>
                <View style={styles.typeTag}>
                  <Text style={styles.typeTagText}>{job.type}</Text>
                </View>
                {job.tags.map((tag, tagIndex) => (
                  <View
                    key={tagIndex}
                    style={[
                      styles.tag,
                      tag === 'Marketing' ? styles.marketingTag : styles.designTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        tag === 'Marketing' ? styles.marketingTagText : styles.designTagText,
                      ]}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.showAllButton}>
        <Text style={styles.showAllText}>Show all jobs</Text>
        <ArrowRight size={20} color="#4F46E5" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC', // Slate-50
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  companyInfo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F0FDFA', // Teal-50
    borderRadius: 100,
  },
  typeTagText: {
    color: '#0D9488', // Teal-600
    fontSize: 12,
    fontWeight: '600',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  marketingTag: {
    borderColor: '#FB923C', // Orange-400
    backgroundColor: 'transparent',
  },
  marketingTagText: {
    color: '#EA580C', // Orange-600
  },
  designTag: {
    borderColor: '#6366F1', // Indigo-500
    backgroundColor: 'transparent',
  },
  designTagText: {
    color: '#4F46E5', // Indigo-600
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  showAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
});

export default LatestJobsSection;
