'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
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
import {
  companyRegistrationSchema,
  type CompanyRegistrationFormData,
} from './schema';
import { COLORS } from '../../../constants/theme';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { useCreateCompany } from '../../../../hooks/useCreateCompany';
import { useAddCompanyEmployee } from '../../../../hooks/useAddCompanyEmployee';
import type { CompanyRole } from '../../../../api/company';

export default function EmployerNewCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);

  const { data: currentUser } = useGetEmployerProfile();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValidating },
    setValue,
    trigger,
  } = useForm<CompanyRegistrationFormData>({
    resolver: yupResolver(companyRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      companyName: '',
      website: '',
      scale: '',
      industry: '',
      companyDescription: '',
      logoUrl: null,
    },
  });

  // Watch fields for tracking
  const companyDescription = watch('companyDescription');
  const logoUrl = watch('logoUrl');

  const { submitCompany, loading: creatingCompany } = useCreateCompany({
    onSuccess: async () => {
      // Refetch employer profile to update affiliation
      await queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : 'Failed to create company';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    },
  });

  const { submitAddEmployee, loading: addingMembers } = useAddCompanyEmployee();

  const loading = creatingCompany || addingMembers;
  const initializedRef = useRef(false);

  // Initialize with current user as owner
  useEffect(() => {
    if (currentUser && !initializedRef.current) {
      initializedRef.current = true;
      const owner = convertUserToTeamMember(currentUser);
      if (owner) {
        setTeamMembers([owner]);
      }
    }
  }, [currentUser]);

  const handleNext = async () => {
    // Validate current step
    const isValid = await trigger();
    if (isValid) {
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

  const handleRoleChange = (email: string, newRole: CompanyRole) => {
    const normalized: CompanyRole = newRole === 'admin' ? 'admin' : 'employee';
    setTeamMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role: normalized } : m))
    );
  };

  const handleAddMember = (member: TeamMember) => {
    if (!teamMembers.some((m) => m.email === member.email)) {
      setTeamMembers((prev) => [...prev, member]);
    }
  };

  const handleRemoveMember = (email: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const onSubmit = async (data: CompanyRegistrationFormData) => {
    try {
      // Prepare payload for backend
      const payload = {
        name: data.companyName,
        websiteUrl: data.website || undefined,
        sizeRange: data.scale || undefined,
        industry: data.industry || undefined,
        description: data.companyDescription || undefined,
        logoUrl: data.logoUrl || undefined,
      };

      // Create company
      const company = await submitCompany(payload);

      // Get current user email
      const currentUserEmail = currentUser?.email?.toLowerCase();

      // Add team members (excluding the current user)
      const membersToAdd = teamMembers.filter((member) => {
        const memberEmail = member.email.toLowerCase();
        return currentUserEmail ? memberEmail !== currentUserEmail : true;
      });

      if (membersToAdd.length > 0) {
        const addResults = await Promise.allSettled(
          membersToAdd.map((member) =>
            submitAddEmployee(company.id, {
              email: member.email,
              role: member.role || undefined,
            })
          )
        );

        const failedAdds = addResults.filter(
          (result) => result.status === 'rejected'
        ).length;

        if (failedAdds > 0) {
          Toast.show({
            type: 'warning',
            text1: 'Partial Success',
            text2: `${failedAdds} team member(s) could not be added. You can retry in Company Profile.`,
          });
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Company "${data.companyName}" registered successfully!`,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        router.push('/pages/employer/dashboard');
      }, 1200);
    } catch (error) {
      // Error is handled in the onError callback of useCreateCompany
      console.error('Company registration failed:', error);
    }
  };

  const stepIndicatorStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 3,
    currentStepStrokeWidth: 5,
    stepStrokeCurrentColor: COLORS.primary2,
    stepIndicatorCurrentColor: COLORS.primary2,
    stepIndicatorLabelCurrentColor: COLORS.slate200,
    stepIndicatorFinishedColor: COLORS.primary2,
    stepIndicatorUnFinishedColor: COLORS.slate200,
    separatorFinishedColor: COLORS.primary2,
    separatorUnFinishedColor: COLORS.slate200,
    labelFontFamily: 'System',
    labelFontSize: 12,
    labelColor: COLORS.slate500,
    currentStepLabelColor: COLORS.primary2,
    stepIndicatorLabelFontSize: 12,
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['left', 'right']}>
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
                if (position < currentStep) {
                  setCurrentStep(position);
                }
              }}
            />
          </View>

          {/* Steps Content */}
          <View className="bg-white rounded-lg border border-slate-200 overflow-hidden min-h-96">
            {currentStep === 0 && (
              <BasicInfoStep
                control={control}
                errors={errors}
                isValidating={isValidating}
                logoUrl={logoUrl || null}
                onLogoChange={(url) => setValue('logoUrl', url)}
              />
            )}

            {currentStep === 1 && (
              <AboutCompanyStep
                control={control}
                errors={errors}
                description={companyDescription || ''}
              />
            )}

            {currentStep === 2 && (
              <TeamStep
                members={teamMembers}
                canManage
                currentUserEmail={currentUser?.email ?? ''}
                onRoleChange={handleRoleChange}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                errors={errors}
              />
            )}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View
          className="border-t border-slate-200 bg-white px-4 pt-4 flex-row gap-3"
          style={{ paddingBottom: insets.bottom }}
        >
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
                ? () => handleSubmit(onSubmit)()
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
              <ActivityIndicator color={COLORS.white} />
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
