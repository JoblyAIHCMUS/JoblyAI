import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import CategoriesSection from './components/landing/CategoriesSection';
import CompaniesSection from './components/landing/CompaniesSection';
import FeaturedJobsSection from './components/landing/FeaturedJobsSection';
import Footer from './components/landing/Footer';
import Header from './components/landing/Header';
import HeroSection from './components/landing/HeroSection';
import LatestJobsSection from './components/landing/LatestJobsSection';
import Sidebar from './components/landing/Sidebar';

export default function Index() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <Header onMenuPress={() => setIsSidebarOpen(true)} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HeroSection />
        <CompaniesSection />
        <CategoriesSection />
        <FeaturedJobsSection />
        <LatestJobsSection />
        <Footer />
      </ScrollView>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLoginPress={() => {
          setIsSidebarOpen(false);
          router.push('/pages/(auth)/login');
        }}
        onSignUpPress={() => {
          setIsSidebarOpen(false);
          router.push('/pages/(auth)/register');
        }}
      />
    </View>
  );
}
