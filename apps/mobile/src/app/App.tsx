import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Header from './components/landing/Header';
import Sidebar from './components/landing/Sidebar';
import HeroSection from './components/landing/HeroSection';
import CompaniesSection from './components/landing/CompaniesSection';
import CategoriesSection from './components/landing/CategoriesSection';
import FeaturedJobsSection from './components/landing/FeaturedJobsSection';
import LatestJobsSection from './components/landing/LatestJobsSection';
import Footer from './components/landing/Footer';

export const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header onOpenMenu={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
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
    </SafeAreaProvider>
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
