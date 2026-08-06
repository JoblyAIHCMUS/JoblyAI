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
import BasicInfoStep from './components/BasicInfoStepEdit';
import AboutCompanyStep from './components/AboutCompanyStepEdit';
import TeamStep from './components/TeamStepEdit';
import { NEW_COMPANY_STEPS } from '../new-company/constants';
import {
  convertCompanyEmployeeToTeamMember,
  type TeamMemberData,
  type TeamMember,
} from './data';
import { companyUpdateSchema, type CompanyUpdateFormData } from './schema';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { useGetCompany } from '../../../../hooks/useGetCompany';
import { useGetCompanyEmployees } from '../../../../hooks/useGetCompanyEmployees';
import { useUpdateCompany } from '../../../../hooks/useUpdateCompany';
import { useAddCompanyEmployee } from '../../../../hooks/useAddCompanyEmployee';
import { useUpdateCompanyEmployeeRole } from '../../../../hooks/useUpdateCompanyEmployeeRole';
import { useRemoveCompanyEmployee } from '../../../../hooks/useRemoveCompanyEmployee';
import type { CompanyRole } from '../../../../api/company';
import { createUploadUrl, uploadFileToGcs } from '../../../../api/gcs';
import { updateCompanyLogo, deleteCompanyLogo } from '../../../../api/company';
import { COLORS } from '../../../constants/theme';

export default function EmployerEditCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [removingMember, setRemovingMember] = useState<TeamMemberData | null>(
    null
  );
  const [originalLogoUrl, setOriginalLogoUrl] = useState<string | null>(null);

  const { submitRoleUpdate } = useUpdateCompanyEmployeeRole();
  const { submitRemove } = useRemoveCompanyEmployee();

  const { data: currentUser, isPending: loadingEmployer } =
    useGetEmployerProfile();

  const hasShownAccessDeniedToast = useRef(false);

  const isCompanyAdmin = currentUser?.isCompanyAdmin ?? false;

  const {
    data: company,
    isPending: loadingCompany,
    error: errorCompany,
  } = useGetCompany(companyId);

  const { data: companyEmployees, isPending: loadingEmployees } =
    useGetCompanyEmployees(companyId);

  // Extract company ID from current user's employer profile
  useEffect(() => {
    if (currentUser?.id) {
      setCompanyId(currentUser.company?.id || null);
    }
  }, [currentUser?.id, currentUser?.company?.id]);

  // Show error and redirect if no company is found
  useEffect(() => {
    if (currentUser && !currentUser.company?.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No company associated with your profile',
      });
      router.back();
    }
  }, [currentUser, router]);

  // Redirect non-admin employer users back to the company profile page
  useEffect(() => {
    if (loadingEmployer) return;
    if (!currentUser) return;
    if (currentUser.isCompanyAdmin) return;

    if (!hasShownAccessDeniedToast.current) {
      hasShownAccessDeniedToast.current = true;
      Toast.show({
        type: 'error',
        text1: 'Access denied',
        text2: 'Only the company admin can edit the company profile.',
      });
    }
    router.replace('/pages/employer/company-profile');
  }, [currentUser, loadingEmployer, router]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValidating },
    setValue,
    trigger,
  } = useForm<CompanyUpdateFormData>({
    resolver: yupResolver(companyUpdateSchema),
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

  const { submitUpdate, loading: updatingCompany } = useUpdateCompany({
    onSuccess: async () => {
      // Refetch company and employee data
      await queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      await queryClient.invalidateQueries({
        queryKey: ['company-employees', companyId],
      });
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : 'Failed to update company';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    },
  });

  const { submitAddEmployee, loading: addingMembers } = useAddCompanyEmployee();

  const loading = updatingCompany || addingMembers;
  const initializedRef = useRef(false);

  // Initialize form with company data when loaded
  useEffect(() => {
    if (company && !initializedRef.current) {
      initializedRef.current = true;
      setValue('companyName', company.name || '');
      setValue('website', company.websiteUrl || '');
      setValue('scale', company.sizeRange || '');
      setValue('industry', company.industry || '');
      setValue('companyDescription', company.description || '');
      setValue('logoUrl', company.logoUrl || null);
      setOriginalLogoUrl(company.logoUrl || null);
    }
  }, [company, setValue]);

  // Initialize team members when employees are loaded
  useEffect(() => {
    if (companyEmployees && companyEmployees.length > 0) {
      const ownerMembershipId = currentUser?.company?.adminId ?? null;
      const members = companyEmployees.map((emp) =>
        convertCompanyEmployeeToTeamMember(emp, ownerMembershipId)
      );
      setTeamMembers(members);
    }
  }, [companyEmployees, currentUser?.company?.adminId]);

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

  const handleRoleChange = async (
    member: TeamMemberData,
    newRole: CompanyRole
  ) => {
    if (!companyId) return;
    setBusy((prev) => ({ ...prev, [member.email]: true }));
    try {
      await submitRoleUpdate(companyId, { email: member.email, role: newRole });
      try {
        await queryClient.invalidateQueries({
          queryKey: ['company-employees', companyId],
        });
      } catch {
        Toast.show({
          type: 'warning',
          text1: 'Role was updated, but team list refresh failed.',
        });
      }
      Toast.show({
        type: 'success',
        text1: `Updated ${member.email} to ${newRole}`,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: `Failed to update role for ${member.email}`,
      });
    } finally {
      setBusy((prev) => ({ ...prev, [member.email]: false }));
    }
  };

  const handleAddMember = (member: TeamMember) => {
    if (!teamMembers.some((m) => m.email === member.email)) {
      setTeamMembers((prev) => [...prev, member]);
    }
  };

  const handleRemovePress = (member: TeamMemberData) => {
    setRemovingMember(member);
  };

  const handleConfirmRemove = async () => {
    const target = removingMember;
    if (!target || !companyId) {
      setRemovingMember(null);
      return;
    }
    setBusy((prev) => ({ ...prev, [target.email]: true }));
    try {
      await submitRemove(companyId, { email: target.email });
      try {
        await queryClient.invalidateQueries({
          queryKey: ['company-employees', companyId],
        });
      } catch {
        Toast.show({
          type: 'warning',
          text1: 'Member was removed, but team list refresh failed.',
        });
      }
      Toast.show({
        type: 'success',
        text1: `Removed ${target.email} from company team`,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: `Failed to remove ${target.email} from company`,
      });
    } finally {
      setBusy((prev) => ({ ...prev, [target.email]: false }));
      setRemovingMember(null);
    }
  };

  const handleCancelRemove = () => {
    setRemovingMember(null);
  };

  const isLocalFile = (url: string | null): boolean => {
    if (!url) return false;
    return url.startsWith('file://') || url.startsWith('content://');
  };

  const onSubmit = async (data: CompanyUpdateFormData) => {
    if (!companyId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Company ID is missing',
      });
      return;
    }

    try {
      // Handle logo change if needed
      const newLogoUrl = data.logoUrl;
      if (newLogoUrl !== originalLogoUrl) {
        if (isLocalFile(newLogoUrl) && newLogoUrl) {
          // Upload new logo to GCS
          const response = await fetch(newLogoUrl);
          const blob = await response.blob();
          const fileName = `logo_${Date.now()}.jpg`;
          const fileType = blob.type || 'image/jpeg';

          const uploadUrlRes = await createUploadUrl({
            fileName,
            fileType,
            folder: 'logos',
          });

          await uploadFileToGcs(uploadUrlRes.uploadUrl, blob, fileType);

          const updatedCompany = await updateCompanyLogo(companyId, {
            fileKey: uploadUrlRes.fileKey,
            fileUrl: uploadUrlRes.fileUrl,
          });

          const newLogo = updatedCompany.logoUrl || null;
          setOriginalLogoUrl(newLogo);
          setValue('logoUrl', newLogo);
        } else if (!newLogoUrl && originalLogoUrl) {
          // Logo was removed
          await deleteCompanyLogo(companyId);
          setOriginalLogoUrl(null);
          setValue('logoUrl', null);
        }
      }

      // Prepare payload for backend - logo handled separately above
      const payload = {
        name: data.companyName,
        websiteUrl: data.website || undefined,
        sizeRange: data.scale || undefined,
        industry: data.industry || undefined,
        description: data.companyDescription || undefined,
      };

      // Update company
      await submitUpdate(companyId, payload);

      // Add new team members (those marked as editable and not already in the company)
      const existingEmails = new Set(
        companyEmployees?.map((emp) => emp.email.toLowerCase()) || []
      );

      const newMembers = teamMembers.filter((member) => {
        const memberEmail = member.email.toLowerCase();
        return (
          !existingEmails.has(memberEmail) &&
          memberEmail !== currentUser?.email?.toLowerCase()
        );
      });

      if (newMembers.length > 0) {
        const addResults = await Promise.allSettled(
          newMembers.map((member) =>
            submitAddEmployee(companyId, {
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
            text2: `${failedAdds} team member(s) could not be added. You can retry later.`,
          });
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Company "${data.companyName}" updated successfully!`,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      // Error is handled in the onError callback of useUpdateCompany
      console.error('Company update failed:', error);
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

  if (loadingCompany || (companyId && loadingEmployees)) {
    return (
      <SafeAreaView
        className="flex-1 bg-white flex items-center justify-center"
        edges={['left', 'right']}
      >
        <ActivityIndicator size="large" color={COLORS.primary2} />
      </SafeAreaView>
    );
  }

  if (currentUser && !isCompanyAdmin) {
    return (
      <SafeAreaView
        className="flex-1 bg-white flex items-center justify-center px-6"
        edges={['left', 'right']}
      >
        <Text className="text-4xl font-bold text-slate-900 mb-2">403</Text>
        <Text className="text-slate-600 text-center text-base">
          You do not have permission to access this page.
        </Text>
      </SafeAreaView>
    );
  }

  if (errorCompany || !company) {
    return (
      <SafeAreaView
        className="flex-1 bg-white flex items-center justify-center"
        edges={['left', 'right']}
      >
        <Text className="text-center text-slate-900 font-semibold">
          {errorCompany ? 'Failed to load company' : 'Company not found'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
        <KeyboardAwareView className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerClassName="gap-6 px-4 py-4"
          >
          {/* Page Title */}
          <View className="gap-2 mb-2">
            <Text className="text-2xl font-bold text-slate-900">
              Edit Company Profile
            </Text>
            <Text className="text-sm text-slate-600">
              Update your company information.
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
                canManage={!!currentUser?.isCompanyAdmin}
                ownerEmail={
                  teamMembers.find(
                    (m) => m.membershipId === currentUser?.company?.adminId
                  )?.email ?? null
                }
                currentUserEmail={currentUser?.email ?? ''}
                busy={busy}
                removingMember={removingMember}
                onRoleChange={handleRoleChange}
                onRemove={handleRemovePress}
                onConfirmRemove={handleConfirmRemove}
                onCancelRemove={handleCancelRemove}
                onAddMember={handleAddMember}
                errors={errors}
              />
            )}
          </View>
          </ScrollView>
        </KeyboardAwareView>

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
                  ? 'Save Changes'
                  : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
