'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import StepIndicator from 'react-native-step-indicator';
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import BasicInformationStep from './components/BasicInformationStep';
import JobDescriptionStep from './components/JobDescriptionStep';
import { NEW_JOB_STEPS } from './constants';
import type { SkillEntry } from './components/SkillTagsManager';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { useCreateJob } from '../../../../hooks/useCreateJob';
import { useSkillIds } from '../../../../hooks/useSkillIds';
import { useCategories } from '../../../../hooks/useCategories';
import type { CreateJobPayload } from '../../../../types/job';
import type {
  EmploymentType,
  RequirementImportance,
} from '../../../../types/job';

interface FormData {
  title: string;
  type: string;
  remote: boolean;
  location: string;
  categoryId: string;
  currency: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: SkillEntry[];
  description: string;
}

const isHtmlContentEmpty = (html: string): boolean => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text === '';
};

// Helper to convert SkillImportance to RequirementImportance
const convertToRequirementImportance = (
  importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL'
): RequirementImportance => {
  if (importance === 'OPTIONAL') {
    return 'OPTIONAL';
  }
  return importance as RequirementImportance;
};

export default function EmployerNewJobPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { data: employerProfile, refetch: fetchEmployerProfile } =
    useGetEmployerProfile();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: '',
    remote: false,
    location: '',
    categoryId: '',
    currency: 'none',
    salaryMin: undefined,
    salaryMax: undefined,
    skills: [],
    description: '',
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const { submitJob, loading: creatingJob } = useCreateJob({
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Job posted successfully!',
      });
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (err) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to post job. Please try again.',
      });
    },
  });

  const { getOrCreateSkills, loading: skillsLoading } = useSkillIds();
  const { loading: categoriesLoading } = useCategories();

  // Fetch employer profile on mount
  useEffect(() => {
    fetchEmployerProfile();
  }, [fetchEmployerProfile]);

  // Validation for each step
  const canProceed = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepIndex === 0) {
      // Basic Information validation
      if (!formData.title.trim() || formData.title.trim().length < 2) {
        newErrors.title = 'Job title must be at least 2 characters';
      }
      if (!formData.type) {
        newErrors.type = 'Please select employment type';
      }
      if (!formData.remote && !formData.location.trim()) {
        newErrors.location = 'Location is required for non-remote jobs';
      }
      if (!formData.categoryId) {
        newErrors.categoryId = 'Please select a category';
      }

      // Salary validation
      if (formData.currency && formData.currency !== 'none') {
        if (formData.salaryMin === undefined) {
          newErrors.salaryMin = 'Minimum salary is required';
        }
        if (formData.salaryMax === undefined) {
          newErrors.salaryMax = 'Maximum salary is required';
        }
        if (
          formData.salaryMin !== undefined &&
          formData.salaryMax !== undefined &&
          formData.salaryMin > formData.salaryMax
        ) {
          newErrors.salaryMax = 'Maximum salary must be greater than minimum';
        }
      }
    } else if (stepIndex === 1) {
      // Job Description validation
      if (!formData.description || isHtmlContentEmpty(formData.description)) {
        newErrors.description = 'Job description is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (canProceed(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!canProceed(currentStep)) {
      return;
    }

    try {
      setLoading(true);

      // 1. Resolve skill IDs (create if needed)
      let requirements = undefined;
      if (formData.skills && formData.skills.length > 0) {
        const skillObjs = await getOrCreateSkills(
          formData.skills.map((s) => s.name)
        );
        // Map skill names to IDs
        requirements = formData.skills.map((s) => {
          const skillObj = skillObjs.find(
            (obj) => obj.name.toLowerCase() === s.name.toLowerCase()
          );
          return {
            skillId: skillObj ? skillObj.id : 0,
            importance: convertToRequirementImportance(s.importance),
            minYearsExperience: s.minYearsExperience || 0,
          };
        });
      }

      const payload: CreateJobPayload = {
        title: formData.title,
        description: formData.description,
        type: formData.type as EmploymentType,
        remote: formData.remote,
        location: formData.remote ? undefined : formData.location,
        categoryId: Number(formData.categoryId),
        currency:
          formData.currency === 'none'
            ? undefined
            : formData.currency.toUpperCase(),
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        companyId: employerProfile?.company?.id || 0,
        requirements,
      };

      await submitJob(payload);
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const stepIndicatorStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#4F46E5',
    stepIndicatorCurrentColor: '#4F46E5',
    stepIndicatorLabelCurrentColor: '#e2e8f0',
    stepIndicatorFinishedColor: '#4F46E5',
    stepIndicatorUnFinishedColor: '#e2e8f0',
    separatorFinishedColor: '#4F46E5',
    separatorUnFinishedColor: '#e2e8f0',
    labelAlign: 'center' as const,
    labelSize: 12,
    currentStepLabelColor: '#4F46E5',
    stepLabelColor: '#64748B',
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setSidebarOpen(true)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        scrollEnabled={currentStep === 0} // Only allow scroll on first step
      >
        <View className="px-4 py-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-slate-900">
              Post a New Job
            </Text>
            <Text className="text-base text-slate-600 mt-2">
              Fill in the details to create a new job posting.
            </Text>
          </View>

          {/* Step Indicator */}
          <View className="mb-8 px-2">
            <StepIndicator
              stepCount={NEW_JOB_STEPS.length}
              direction="horizontal"
              currentPosition={currentStep}
              labels={NEW_JOB_STEPS.map((step) => step.label)}
              customStyles={stepIndicatorStyles}
            />
          </View>

          {/* Step Content */}
          <View className="flex-1 min-h-96">
            {currentStep === 0 && (
              <BasicInformationStep
                title={formData.title}
                onTitleChange={(value) =>
                  setFormData({ ...formData, title: value })
                }
                type={formData.type}
                onTypeChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                remote={formData.remote}
                onRemoteChange={(value) =>
                  setFormData({ ...formData, remote: value })
                }
                location={formData.location}
                onLocationChange={(value) =>
                  setFormData({ ...formData, location: value })
                }
                categoryId={formData.categoryId}
                onCategoryChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
                currency={formData.currency}
                onCurrencyChange={(value) =>
                  setFormData({
                    ...formData,
                    currency: value,
                    salaryMin: undefined,
                    salaryMax: undefined,
                  })
                }
                salaryMin={formData.salaryMin}
                onSalaryMinChange={(value) =>
                  setFormData({ ...formData, salaryMin: value })
                }
                salaryMax={formData.salaryMax}
                onSalaryMaxChange={(value) =>
                  setFormData({ ...formData, salaryMax: value })
                }
                skills={formData.skills}
                onSkillsChange={(value) =>
                  setFormData({ ...formData, skills: value })
                }
                errors={errors}
              />
            )}

            {currentStep === 1 && (
              <JobDescriptionStep
                description={formData.description}
                onDescriptionChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                error={errors.description}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="border-t border-slate-200 bg-white px-4 py-4 gap-3">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-white disabled:opacity-50"
          >
            <Text className="text-center text-slate-900 font-semibold">
              Previous
            </Text>
          </TouchableOpacity>

          {currentStep < NEW_JOB_STEPS.length - 1 ? (
            <TouchableOpacity
              onPress={handleNext}
              disabled={
                loading || creatingJob || skillsLoading || categoriesLoading
              }
              className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 disabled:opacity-50"
            >
              <Text className="text-center text-white font-semibold">
                {loading ? 'Loading...' : 'Next'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                loading || creatingJob || skillsLoading || categoriesLoading
              }
              className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 disabled:opacity-50 flex-row items-center justify-center gap-2"
            >
              {(loading || creatingJob) && (
                <ActivityIndicator color="white" size="small" />
              )}
              <Text className="text-center text-white font-semibold">
                {loading || creatingJob ? 'Posting...' : 'Post Job'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sidebar */}
      <EmployerDashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
