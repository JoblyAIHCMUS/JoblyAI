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
import { useRouter, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import StepIndicator from 'react-native-step-indicator';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import BasicInformationStep from './components/BasicInformationStep';
import JobDescriptionStep from './components/JobDescriptionStep';
import { NEW_JOB_STEPS } from './constants';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { useCreateJob } from '../../../../hooks/useCreateJob';
import { useSkillIds } from '../../../../hooks/useSkillIds';
import { useCategories } from '../../../../hooks/useCategories';
import type { CreateJobPayload } from '../../../../types/job';
import type {
  EmploymentType,
  RequirementImportance,
} from '../../../../types/job';
import { jobPostingSchema, type JobPostingFormData } from './schema';
import { COLORS } from '../../../constants/theme';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';

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

export default function EmployerNewJobPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { data: employerProfile, refetch: fetchEmployerProfile } =
    useGetEmployerProfile();

  // Form setup with yup validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<JobPostingFormData>({
    // @ts-expect-error yup.InferType creates nullable fields, but react-hook-form expects undefined
    resolver: yupResolver(jobPostingSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      type: 'FULL_TIME' as const,
      remote: false,
      location: null,
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
        (!!currentValues.location &&
          (currentValues.location as { formattedAddress?: string })
            .formattedAddress !== undefined);

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
        (!!currentValues.location &&
          (currentValues.location as { formattedAddress?: string })
            .formattedAddress !== undefined);

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

      const payload: CreateJobPayload = {
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
    stepStrokeCurrentColor: COLORS.primary2,
    stepIndicatorCurrentColor: COLORS.primary2,
    stepIndicatorLabelCurrentColor: COLORS.slate200,
    stepIndicatorFinishedColor: COLORS.primary2,
    stepIndicatorUnFinishedColor: COLORS.slate200,
    separatorFinishedColor: COLORS.primary2,
    separatorUnFinishedColor: COLORS.slate200,
    labelAlign: 'center' as const,
    labelSize: 12,
    currentStepLabelColor: COLORS.primary2,
    stepLabelColor: COLORS.slate500,
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setSidebarOpen(true)} />

      <KeyboardAwareView className="flex-1">
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
              // @ts-expect-error yup/react-hook-form type mismatch
              onPress={handleSubmit(handleSubmit_)}
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
      </KeyboardAwareView>

      {/* Sidebar */}
      <EmployerDashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
