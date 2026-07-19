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
import { ApiKeysSection } from '@/features/employer/settings/components/api-keys';
import ChangePasswordForm from './components/ChangePasswordForm';
import { NotificationOptions } from './components/NotificationOptions';
import { useGetCandidateProfile } from '@/api-hook/candidate';
import { useNotificationSettings } from '@/api-hook/notification';
import { useUpdatePersonalDetails } from '@/api-hook/user/useUpdatePersonalDetails';
import { useToast } from '@/hooks/useToast';
import { SETTINGS_TABS } from './constants';
import {
  PersonalDetailsSchema,
  type PersonalDetailsFormData,
  formatDateToYYYYMMDD,
} from '@/lib/validation';
import { formatErrorForDisplay } from '@/lib/errors';
import type { CandidateProfileResponse } from '@/api-client/candidate';
import type {
  NotificationSettings,
  NotificationSettingsKey,
} from '@/types/notification';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  applications: true,
  jobs: true,
  recommendations: true,
  messages: true,
};

export default function CandidateSettingsPage() {
  const { setTitle } = usePageTitle();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-profile');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    'https://placehold.co/124x124'
  );
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => {
    setTitle('Settings');
  }, [setTitle]);

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

  const handleProfileSuccess = useCallback(
    (data: CandidateProfileResponse) => {
      const dobString = formatDateToYYYYMMDD(data.dateOfBirth);

      if (data.avatarUrl) {
        setProfilePhoto(data.avatarUrl);
      }

      reset({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        email: data.email || '',
        dateOfBirth: dobString,
        gender: data.gender || '',
      });
    },
    [reset]
  );

  const { fetchCandidateProfile, loading: loadingProfile } =
    useGetCandidateProfile({
      onSuccess: handleProfileSuccess,
    });

  const { updateDetails, loading: updatingProfile } =
    useUpdatePersonalDetails();

  const {
    fetchSettings: fetchNotificationSettings,
    updateSettings: updateNotificationSettings,
    loading: loadingNotificationSettings,
    saving: savingNotificationSettings,
  } = useNotificationSettings();

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    setProfilePhoto(newAvatarUrl);
    fetchCandidateProfile();
  };

  const handleAvatarRemoved = () => {
    const firstName = methods.getValues('firstName');
    const lastName = methods.getValues('lastName');
    const seed = `${firstName} ${lastName}`.trim() || 'User';
    setProfilePhoto(
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        seed
      )}`
    );
    fetchCandidateProfile();
  };

  const handleNotificationChange = async (key: NotificationSettingsKey) => {
    const previousSettings = notificationSettings;
    const nextSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };

    setNotificationSettings(nextSettings);

    try {
      const savedSettings = await updateNotificationSettings({
        [key]: nextSettings[key],
      });
      setNotificationSettings(savedSettings);
      toast.success('Notification settings updated');
    } catch (error) {
      setNotificationSettings(previousSettings);
      toast.error(
        formatErrorForDisplay(error, 'Failed to update notification settings')
      );
    }
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

      toast.success('Profile updated successfully');

      setTimeout(() => {
        router.push('/candidate/profile');
      }, 800);
    } catch {
      // Error handled by toast in updateDetails hook
    }
  };

  const isSaving = updatingProfile || isSubmitting;

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

  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const settings = await fetchNotificationSettings();
        setNotificationSettings(settings);
      } catch (error) {
        toast.error(
          formatErrorForDisplay(error, 'Failed to load notification settings')
        );
      }
    };

    loadNotificationSettings();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col flex-1"
      >
        {/* Header Section with Tabs */}
        <div className="sticky top-0 z-10 border-b border-[#d6ddeb] bg-white px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4 md:pt-5">
          <SettingsTabs
            tabs={SETTINGS_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* My Profile Tab Content */}
        <TabsContent
          value="my-profile"
          className="self-stretch bg-white flex flex-col justify-start items-start gap-4 sm:gap-5 md:gap-6 !mt-0 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-1"
        >
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-5 md:gap-6 w-full max-w-4xl mx-auto"
            >
              {/* Section Header */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <h2 className="heading-h6-semi-bold sm:heading-h5-semi-bold text-[var(--text-primary)] text-sm sm:text-base">
                  Basic Information
                </h2>
                <p className="body-body-1-regular text-[var(--text-tertiary)] text-xs sm:text-sm">
                  This is your personal information that you can update anytime.
                </p>
              </div>

              {/* Divider */}
              <hr className="self-stretch border-[#d6ddeb]" />

              {/* Profile Photo */}
              <div className="self-stretch w-full">
                <ProfilePhotoSection
                  photoUrl={profilePhoto}
                  onAvatarUpdated={handleAvatarUpdated}
                  onAvatarRemoved={handleAvatarRemoved}
                  disabled={loadingProfile || isSaving}
                />
              </div>

              {/* Divider */}
              <hr className="self-stretch border-[#d6ddeb]" />

              {/* Personal Details Form */}
              <div className="self-stretch w-full">
                <PersonalDetailsForm disabled={loadingProfile || isSaving} />
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                disabled={loadingProfile || isSaving}
                className="text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6 py-2 sm:py-2.5 bg-[var(--bg-accent-solid,#4f46e5)] text-white label-label-2-semi-bold sm:label-label-1-semi-bold hover:opacity-90 rounded transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>

              {/* Divider */}
              <hr className="self-stretch border-[#d6ddeb]" />

              {/* Change Password Section */}
              <div className="self-stretch flex flex-col sm:grid gap-4 sm:gap-6 md:grid-cols-[280px_1fr] w-full">
                {/* Left: Title & Desc */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base">
                    Change Password
                  </div>
                  <div className="body-body-1-regular text-[var(--text-tertiary)] text-xs sm:text-sm">
                    Manage your password to make sure it is safe
                  </div>
                </div>
                {/* Right: Password form */}
                <ChangePasswordForm />
              </div>

              {/* Divider */}
              <hr className="self-stretch border-[#d6ddeb]" />
            </form>
          </FormProvider>
        </TabsContent>

        {/* System Settings Tab Content */}
        <TabsContent
          value="system-settings"
          className="self-stretch flex flex-col gap-4 sm:gap-5 md:gap-6 bg-white !mt-0 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-1"
        >
          {/* Section Header */}
          <div className="flex flex-col gap-1">
            <h2 className="heading-h6-semi-bold sm:heading-h5-semi-bold text-[var(--text-primary)] text-sm sm:text-base">
              Notifications
            </h2>
            <p className="body-body-1-regular text-[var(--text-tertiary)] text-xs sm:text-sm">
              Manage push delivery preferences. Notification Center keeps your
              system history.
            </p>
          </div>

          {/* Divider */}
          <hr className="self-stretch border-[#d6ddeb]" />

          {/* Notifications Section */}
          <NotificationOptions
            notifications={notificationSettings}
            onChange={handleNotificationChange}
            disabled={loadingNotificationSettings || savingNotificationSettings}
          />
        </TabsContent>

        {/* Developer Tab Content */}
        <TabsContent
          value="developer"
          className="self-stretch flex flex-col gap-4 sm:gap-5 md:gap-6 bg-white !mt-0 flex-1"
        >
          <ApiKeysSection role="candidate" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
