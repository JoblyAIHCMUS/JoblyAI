'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/contexts/page-title-context';
import {
  SettingsTabs,
  ProfilePhotoSection,
  PersonalDetailsForm,
} from './components';
import ChangePasswordForm from './components/ChangePasswordForm';
import { NotificationOptions } from './components/NotificationOptions';
import { useGetCandidateProfile } from '@/api-hook/candidate';
import { useUpdatePersonalDetails } from '@/api-hook/user/useUpdatePersonalDetails';
import { useToast } from '@/hooks/useToast';
import { SETTINGS_TABS } from './constants';
import {
  PersonalDetailsSchema,
  type PersonalDetailsFormData,
  formatDateToYYYYMMDD,
} from '@/lib/validation';
import { formatErrorForDisplay } from '@/lib/errors';
import type { CandidateProfileResponse } from '@/api-client/candidate/types';

export default function CandidateSettingsPage() {
  const { setTitle } = usePageTitle();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setTitle('Settings');
  }, [setTitle]);

  const [activeTab, setActiveTab] = useState('my-profile');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    'https://placehold.co/124x124'
  );

  // React Hook Form with Zod validation
  const methods = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(PersonalDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '',
      gender: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Hook for updating personal details
  const { updateDetails } = useUpdatePersonalDetails({
    onSuccess: () => {
      toast.success('Personal details updated successfully');
    },
    onError: (error) => {
      toast.error(
        formatErrorForDisplay(error, 'Failed to update personal details')
      );
    },
  });

  // Memoized success callback for fetching profile
  const handleProfileSuccess = useCallback(
    (data: CandidateProfileResponse) => {
      const dobString = formatDateToYYYYMMDD(data.dateOfBirth);

      if (data.avatarUrl) {
        setProfilePhoto(data.avatarUrl);
      }

      reset({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: dobString,
        gender: data.gender || '',
      });
    },
    [reset]
  );

  // Hook to load candidate profile data
  const { fetchCandidateProfile } = useGetCandidateProfile({
    onSuccess: handleProfileSuccess,
  });

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    setProfilePhoto(newAvatarUrl);
    // Emit event to notify topbar to refetch profile
    window.dispatchEvent(new Event('profile-updated'));
  };

  const onSubmit = async (formData: PersonalDetailsFormData) => {
    try {
      await updateDetails({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      await fetchCandidateProfile();

      // Emit event to notify topbar to refetch profile
      window.dispatchEvent(new Event('profile-updated'));

      setTimeout(() => {
        router.push('/candidate/profile');
      }, 800);
    } catch {
      // Error handled by onError callback
    }
  };

  // Load profile data on component mount (only once)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchCandidateProfile();
      } catch (error) {
        toast.error(formatErrorForDisplay(error, 'Failed to load profile'));
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-primary">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header Section with Tabs */}
        <div className="self-stretch px-8 pt-8 border-b border-primary">
          <SettingsTabs
            tabs={SETTINGS_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* My Profile Tab Content */}
        <TabsContent
          value="my-profile"
          className={`self-stretch bg-primary flex flex-col justify-start items-end gap-6 !mt-0${
            activeTab === 'my-profile' ? ' px-8 pt-6 pb-8' : ''
          }`}
        >
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-6"
            >
              {/* Section Header */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <h2 className="text-xl font-semibold font-['Lexend_Deca'] text-primary">
                  Basic Information
                </h2>
                <p className="text-base font-normal font-['Be_Vietnam_Pro'] text-tertiary">
                  This is your personal information that you can update anytime.
                </p>
              </div>

              {/* Divider */}
              <hr className="self-stretch border-primary" />

              {/* Profile Photo */}
              <div className="self-stretch inline-flex justify-start items-start gap-28">
                <ProfilePhotoSection
                  photoUrl={profilePhoto}
                  onAvatarUpdated={handleAvatarUpdated}
                />
              </div>

              {/* Divider */}
              <hr className="self-stretch border-primary" />

              {/* Personal Details Form */}
              <div className="self-stretch inline-flex justify-start items-start gap-60">
                <PersonalDetailsForm />
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="self-end inline-flex items-center justify-center gap-2 px-6 py-3 h-auto bg-[var(--bg-accent-solid,#4f46e5)] hover:opacity-90 rounded-[5px] font-label-label-1-semi-bold text-[length:var(--label-label-1-semi-bold-font-size)] text-[var(--text-white,#ffffff)] text-center tracking-[var(--label-label-1-semi-bold-letter-spacing)] leading-[var(--label-label-1-semi-bold-line-height)] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
              {/* Divider */}
              <hr className="self-stretch border-primary" />

              {/* Change Password Section */}
              <div className="self-stretch grid-cols-[260px_1fr] gap-4 md:grid md:grid-cols-[260px_1fr] md:gap-[117px] flex flex-col sm:flex-col">
                {/* Left: Title & Desc */}
                <div className="flex flex-col gap-1">
                  <div className="heading-h6-semi-bold text-primary">
                    Change Password
                  </div>
                  <div className="body-body-1-regular text-tertiary">
                    Manage your password to make sure it is safe
                  </div>
                </div>
                {/* Right: Password form */}
                <ChangePasswordForm />
              </div>

              {/* Divider */}
              <hr className="self-stretch border-primary" />
            </form>
          </FormProvider>
        </TabsContent>

        {/* System Settings Tab Content */}
        <TabsContent
          value="system-settings"
          className={`self-stretch flex flex-col gap-6 bg-[var(--bg-primary,white)] !mt-0${
            activeTab === 'system-settings' ? ' px-8 pt-6 pb-8' : ''
          }`}
        >
          {/* Section Header */}
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] leading-6 font-['Lexend_Deca'] font-semibold text-primary">
              Basic Information
            </h2>
            <p className="text-base font-normal font-['Be_Vietnam_Pro'] text-tertiary">
              This is notifications preferences that you can update anytime.
            </p>
          </div>

          {/* Divider */}
          <hr
            className="self-stretch"
            style={{
              borderColor: 'var(--border-primary, #CBD5E1)',
              borderWidth: 1,
              outlineOffset: '-0.5px',
            }}
          />

          {/* Notifications Section */}
          <NotificationOptions
            notifications={{
              applications: true,
              jobs: false,
              recommendations: false,
            }}
            onChange={(key: string) => {
              // TODO: Implement notification preferences
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
