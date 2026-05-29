'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import StepIndicator from 'react-native-step-indicator';
import { ArrowLeft } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import BasicInformationStep from './components/BasicInformationStep';
import JobDescriptionStep from './components/JobDescriptionStep';
import { EDIT_JOB_STEPS } from './constants';
import { useEmployerJobDetail } from '../../../../hooks/useEmployerJobDetail';
import { useUpdateJob } from '../../../../hooks/useUpdateJob';
import { useSkillIds } from '../../../../hooks/useSkillIds';
import { useCategories } from '../../../../hooks/useCategories';
import type { UpdateJobPayload } from '../../../../types/job';
import type {
  EmploymentType,
  RequirementImportance,
} from '../../../../types/job';
import { jobPostingSchema, type JobPostingFormData } from './schema';
import { COLORS } from '../../../constants/theme';

const isHtmlContentEmpty = (html: string): boolean => {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text === '';
};

// Helper to validate salary range
const isSalaryRangeValid = (
  currency: string,
  salaryMin: number | undefined,
  salaryMax: number | undefined
): boolean => {
  // Only validate if currency is selected (not 'none')
  if (currency === 'none') {
    return true;
  }

  // If both min and max are provided, min must be <= max
  if (salaryMin != null && salaryMax != null) {
    return salaryMin <= salaryMax;
  }

  return false;
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

export default function EmployerEditJobPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const jobId = Number(id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch job data
  const { data: jobData, isLoading: jobLoading } = useEmployerJobDetail(jobId);

  // Form setup with yup validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    trigger,
    setValue,
  } = useForm<JobPostingFormData>({
    // @ts-expect-error yup.InferType creates nullable fields, but react-hook-form expects undefined
    resolver: yupResolver(jobPostingSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      type: 'FULL_TIME' as const,
      remote: false,
      location: '',
      categoryId: '',
      currency: 'none' as const,
      salaryMin: undefined,
      salaryMax: undefined,
      skills: [],
      description: '',
    },
  });

  // Watch fields for tracking
  const formData = watch();

  // API hooks
  const { submitUpdate, loading: updatingJob } = useUpdateJob({
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Job updated successfully!',
      });
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (err) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update job. Please try again.',
      });
    },
  });

  const { getOrCreateSkills, loading: skillsLoading } = useSkillIds();
  const { loading: categoriesLoading } = useCategories();

  // Pre-fill form when job data loads
  useEffect(() => {
    if (jobData) {
      setValue('title', jobData.title);
      setValue('description', jobData.description);
      setValue('type', jobData.type as EmploymentType);
      setValue('remote', jobData.remote);
      setValue('location', jobData.location || '');
      setValue('categoryId', jobData.category.id.toString());
      setValue(
        'currency',
        (jobData.currency ? jobData.currency.toLowerCase() : 'none') as
          | 'none'
          | 'usd'
          | 'eur'
          | 'gbp'
          | 'vnd'
          | 'jpy'
          | 'cny'
      );
      setValue('salaryMin', jobData.salaryMin ?? undefined);
      setValue('salaryMax', jobData.salaryMax ?? undefined);
      setValue(
        'skills',
        (jobData.requirements || []).map((req) => ({
          name: req.skillName,
          importance: req.importance as 'REQUIRED' | 'PREFERRED' | 'OPTIONAL',
          minYearsExperience: req.minYearsExperience ?? undefined,
        }))
      );
    }
  }, [jobData, setValue]);

  const validateSalaryRange = React.useCallback(() => {
    trigger();
  }, [trigger]);

  // Validation for each step
  const canProceed = (stepIndex: number): boolean => {
    const currentValues = getValues();

    if (stepIndex === 0) {
      // Basic Information validation
      const hasTitle =
        !!currentValues.title && currentValues.title.trim().length >= 2;
      const hasType = !!currentValues.type;
      const hasCategory = !!currentValues.categoryId;
      const hasLocation =
        currentValues.remote ||
        (!!currentValues.location && currentValues.location.trim() !== '');

      const noErrorsInBasic =
        !errors.title &&
        !errors.type &&
        !errors.categoryId &&
        !errors.location &&
        !errors.salaryMin &&
        !errors.salaryMax;

      return (
        hasTitle && hasType && hasCategory && hasLocation && noErrorsInBasic
      );
    } else if (stepIndex === 1) {
      // Job Description validation
      return (
        !errors.description && !isHtmlContentEmpty(formData.description || '')
      );
    }

    return true;
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      await trigger();

      // Check only step 0 errors for advancing
      const currentValues = getValues();
      const hasTitle =
        !!currentValues.title && currentValues.title.trim().length >= 2;
      const hasType = !!currentValues.type;
      const hasCategory = !!currentValues.categoryId;
      const hasLocation =
        currentValues.remote ||
        (!!currentValues.location && currentValues.location.trim() !== '');

      // Validate salary range
      const salaryRangeValid = isSalaryRangeValid(
        currentValues.currency,
        currentValues.salaryMin,
        currentValues.salaryMax
      );

      const noErrorsInBasic =
        !errors.title &&
        !errors.type &&
        !errors.categoryId &&
        !errors.location &&
        !errors.salaryMin &&
        !errors.salaryMax &&
        salaryRangeValid;

      if (
        hasTitle &&
        hasType &&
        hasCategory &&
        hasLocation &&
        noErrorsInBasic
      ) {
        setCurrentStep(currentStep + 1);
      } else if (!salaryRangeValid) {
        // Show error for invalid salary range
        Toast.show({
          type: 'error',
          text1: 'Invalid Salary Range',
          text2: 'Minimum salary must be less than or equal to maximum salary',
        });
      }
    } else {
      // On step 1, only validate description
      const isValid = await trigger('description');
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit_ = async (data: JobPostingFormData) => {
    if (!canProceed(currentStep)) {
      return;
    }

    try {
      setLoading(true);

      // 1. Resolve skill IDs (create if needed)
      let requirements = undefined;
      if (data.skills && data.skills.length > 0) {
        const skillObjs = await getOrCreateSkills(
          data.skills.map((s) => s.name)
        );
        // Map skill names to IDs
        requirements = data.skills.map((s) => {
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

      // Convert null values to undefined for API
      const salaryMin = data.salaryMin === null ? undefined : data.salaryMin;
      const salaryMax = data.salaryMax === null ? undefined : data.salaryMax;

      const payload: UpdateJobPayload = {
        title: data.title,
        description: data.description,
        type: data.type as EmploymentType,
        remote: data.remote,
        location: data.remote ? undefined : data.location,
        categoryId: Number(data.categoryId),
        currency:
          data.currency === 'none' ? undefined : data.currency.toUpperCase(),
        salaryMin,
        salaryMax,
        requirements,
      };

      await submitUpdate(jobId, payload);
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

  if (jobLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-slate-600">Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!jobData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-slate-600 text-center">
            Job not found or you don't have permission to edit it.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            <View className="flex-row items-center gap-3 mb-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={28} color={COLORS.brandDark} strokeWidth={2} />
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-slate-900">
                Edit Job
              </Text>
            </View>
            <Text className="text-base text-slate-600 mt-2">
              Update the job posting details below.
            </Text>
          </View>

          {/* Step Indicator */}
          <View className="mb-8 px-2">
            <StepIndicator
              stepCount={EDIT_JOB_STEPS.length}
              direction="horizontal"
              currentPosition={currentStep}
              labels={EDIT_JOB_STEPS.map((step) => step.label)}
              customStyles={stepIndicatorStyles}
            />
          </View>

          {/* Step Content */}
          <View className="flex-1 min-h-96">
            {currentStep === 0 && (
              <BasicInformationStep
                // @ts-expect-error yup/react-hook-form type mismatch
                control={control}
                errors={errors}
                watch={watch}
                formData={formData}
                onValidate={validateSalaryRange}
              />
            )}

            {currentStep === 1 && (
              <JobDescriptionStep
                // @ts-expect-error yup/react-hook-form type mismatch
                control={control}
                errors={errors}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View
        className="border-t border-slate-200 bg-white px-4 pt-4 gap-3"
        style={{ paddingBottom: 20 + insets.bottom }}
      >
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

          {currentStep < EDIT_JOB_STEPS.length - 1 ? (
            <TouchableOpacity
              onPress={handleNext}
              disabled={
                loading || updatingJob || skillsLoading || categoriesLoading
              }
              className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 disabled:opacity-50"
            >
              <Text className="text-center text-white font-semibold">
                {loading ? 'Loading...' : 'Next'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              // @ts-expect-error yup/react-hook-form type mismatch
              onPress={handleSubmit(handleSubmit_)}
              disabled={
                loading || updatingJob || skillsLoading || categoriesLoading
              }
              className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 disabled:opacity-50 flex-row items-center justify-center gap-2"
            >
              {(loading || updatingJob) && (
                <ActivityIndicator color="white" size="small" />
              )}
              <Text className="text-center text-white font-semibold">
                {loading || updatingJob ? 'Updating...' : 'Save Changes'}
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
