import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { COLORS } from './constants/theme';
import CategoriesSection from './components/landing/CategoriesSection';
import CompaniesSection from './components/landing/CompaniesSection';
import FeaturedJobsSection from './components/landing/FeaturedJobsSection';
import Footer from './components/landing/Footer';
import Header from './components/landing/Header';
import HeroSection from './components/landing/HeroSection';
import LatestJobsSection from './components/landing/LatestJobsSection';
import Sidebar from './components/landing/Sidebar';
import { useLandingData } from '../hooks/useLandingData';

export default function Index() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { featured, latest, companies, categories, refreshing, refreshAll } =
    useLandingData();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <Header onMenuPress={() => setIsSidebarOpen(true)} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            colors={[COLORS.primary2]}
            tintColor={COLORS.primary2}
          />
        }
      >
        <HeroSection />
        <CompaniesSection
          companies={companies.companies}
          loading={companies.loading}
          error={companies.error}
          onRetry={() => void companies.refresh()}
        />
        <CategoriesSection
          categories={categories.categories}
          loading={categories.loading}
          error={categories.error}
          onRetry={() => void categories.refresh()}
        />
        <FeaturedJobsSection
          data={featured.data}
          loading={featured.loading}
          error={featured.error}
          onRetry={() => void featured.refresh()}
        />
        <LatestJobsSection
          data={latest.data}
          loading={latest.loading}
          error={latest.error}
          onRetry={() => void latest.refresh()}
        />
        <Footer />
      </ScrollView>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </View>
  );
}
