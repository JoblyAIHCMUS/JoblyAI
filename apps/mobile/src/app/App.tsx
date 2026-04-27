import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Header from './components/landing/Header';
import HeroSection from './components/landing/HeroSection';
import CompaniesSection from './components/landing/CompaniesSection';
import CategoriesSection from './components/landing/CategoriesSection';
import FeaturedJobsSection from './components/landing/FeaturedJobsSection';
import LatestJobsSection from './components/landing/LatestJobsSection';
import Footer from './components/landing/Footer';

export const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      >
        <HeroSection />
        <CompaniesSection />
        <CategoriesSection />
        <FeaturedJobsSection />
        <LatestJobsSection />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
});

export default App;
