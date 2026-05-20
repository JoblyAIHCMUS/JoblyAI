'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import StepIndicator from 'react-native-step-indicator';
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import BasicInfoStep from './components/BasicInfoStep';
import AboutCompanyStep from './components/AboutCompanyStep';
import TeamStep from './components/TeamStep';
import { NEW_COMPANY_STEPS } from './constants';
import {
  convertUserToTeamMember,
  type TeamMemberData,
  type TeamMember,
} from './data';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';

export default function EmployerNewCompanyPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [scale, setScale] = useState('');
  const [industry, setIndustry] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, any>>({});

  const { data: currentUser } = useGetEmployerProfile();
  const initializedRef = useRef(false);

  // Initialize with current user as owner
  useEffect(() => {
    if (currentUser && !initializedRef.current) {
      initializedRef.current = true;
      const owner = convertUserToTeamMember(currentUser);
      if (owner) {
        setTeamMembers([{ ...owner, isEditable: false }]);
      }
    }
  }, [currentUser]);

  // Validation for each step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, any> = {};

    if (step === 0) {
      if (!companyName.trim()) {
        newErrors.companyName = {
          message: 'Company name is required',
        };
      } else if (companyName.trim().length < 2) {
        newErrors.companyName = {
          message: 'Company name must be at least 2 characters',
        };
      }

      if (!scale) {
        newErrors.scale = {
          message: 'Company size is required',
        };
      }

      if (!industry) {
        newErrors.industry = {
          message: 'Industry is required',
        };
      }

      if (website && !/^(https?:\/\/)?.+\..+/.test(website)) {
        newErrors.website = {
          message: 'Please enter a valid website URL',
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < NEW_COMPANY_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRoleChange = (email: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role: newRole } : m))
    );
  };

  const handleAddMember = (member: TeamMember) => {
    if (!teamMembers.some((m) => m.email === member.email)) {
      setTeamMembers((prev) => [...prev, { ...member, isEditable: true }]);
    }
  };

  const handleRemoveMember = (email: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const handleComplete = async () => {
    if (!validateStep(0)) {
      setCurrentStep(0);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement company creation API call
      console.log('Creating company:', {
        companyName,
        website,
        scale,
        industry,
        logoUrl,
        description,
        teamMembers,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Company "${companyName}" registered successfully!`,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        router.push('/pages/employer/dashboard');
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const stepIndicatorStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 3,
    currentStepStrokeWidth: 5,
    stepStrokeCurrentColor: '#4F46E5',
    stepIndicatorCurrentColor: '#4F46E5',
    stepIndicatorFinishedColor: '#4F46E5',
    stepIndicatorUnFinishedColor: '#e2e8f0',
    separatorFinishedColor: '#4F46E5',
    separatorUnFinishedColor: '#e2e8f0',
    labelFontFamily: 'System',
    labelFontSize: 12,
    labelColor: '#64748B',
    currentStepLabelColor: '#4F46E5',
    stepIndicatorLabelFontSize: 12,
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <EmployerDashboardHeader onMenuPress={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <EmployerDashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="gap-6 px-4 py-4"
        >
          {/* Page Title */}
          <View className="gap-2 mb-2">
            <Text className="text-2xl font-bold text-slate-900">
              Register your Company to Jobly
            </Text>
            <Text className="text-sm text-slate-600">
              Company details can be updated at any time after registration.
            </Text>
          </View>

          {/* Step Indicator */}
          <View className="bg-white rounded-lg p-4 border border-slate-200">
            <StepIndicator
              customStyles={stepIndicatorStyles}
              currentPosition={currentStep}
              labels={NEW_COMPANY_STEPS.map((s) => s.label)}
              stepCount={NEW_COMPANY_STEPS.length}
              onPress={(position) => {
                if (position < currentStep || validateStep(currentStep)) {
                  setCurrentStep(position);
                }
              }}
            />
          </View>

          {/* Steps Content */}
          <View className="bg-white rounded-lg border border-slate-200 overflow-hidden min-h-96">
            {currentStep === 0 && (
              <BasicInfoStep
                companyName={companyName}
                onCompanyNameChange={setCompanyName}
                website={website}
                onWebsiteChange={setWebsite}
                scale={scale}
                onScaleChange={setScale}
                industry={industry}
                onIndustryChange={setIndustry}
                logoUrl={logoUrl}
                onLogoChange={setLogoUrl}
                errors={errors}
              />
            )}

            {currentStep === 1 && (
              <AboutCompanyStep
                description={description}
                onDescriptionChange={setDescription}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <TeamStep
                members={teamMembers}
                onRoleChange={handleRoleChange}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                errors={errors}
              />
            )}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View className="border-t border-slate-200 bg-white px-4 py-4 flex-row gap-3">
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handlePrev}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-300 flex items-center justify-center active:bg-slate-50 disabled:opacity-50"
            >
              <Text className="text-slate-900 font-semibold">Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={
              currentStep === NEW_COMPANY_STEPS.length - 1
                ? handleComplete
                : handleNext
            }
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center active:opacity-90 ${
              loading ? 'opacity-50' : ''
            } ${
              currentStep === NEW_COMPANY_STEPS.length - 1
                ? 'bg-green-600'
                : 'bg-indigo-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold">
                {currentStep === NEW_COMPANY_STEPS.length - 1
                  ? 'Complete'
                  : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
