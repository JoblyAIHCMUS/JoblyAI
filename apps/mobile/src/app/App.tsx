import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './constants/theme';
import Header from './components/landing/Header';
import HeroSection from './components/landing/HeroSection';
import CompaniesSection from './components/landing/CompaniesSection';
import CategoriesSection from './components/landing/CategoriesSection';
import FeaturedJobsSection from './components/landing/FeaturedJobsSection';
import LatestJobsSection from './components/landing/LatestJobsSection';
import Footer from './components/landing/Footer';

export const App = () => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Header />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <HeroSection />
          <CompaniesSection />
          <CategoriesSection />
          <FeaturedJobsSection />
          <LatestJobsSection />
          <Footer />
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
});

export default App;
