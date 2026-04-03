'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  SettingsTabs,
  ProfilePhotoSection,
  PersonalDetailsForm,
  AccountTypeSection,
} from './components';
import UpdateEmailForm from './components/UpdateEmailForm';
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

export default function CandidateSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-profile');
  const [accountType, setAccountType] = useState<'job_seeker' | 'employer'>(
    'job_seeker'
  );
  const [profilePhoto, setProfilePhoto] = useState<string>(
    'https://placehold.co/124x124'
  );
  const [email, setEmail] = useState<string>('');

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

  // Hook to load candidate profile data
  const { fetchCandidateProfile } = useGetCandidateProfile({
    onSuccess: (data) => {
      const dobString = formatDateToYYYYMMDD(data.dateOfBirth);

      if (data.avatarUrl) {
        setProfilePhoto(data.avatarUrl);
      }

      setEmail(data.email || '');

      reset({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: dobString,
        gender: data.gender || '',
      });
    },
  });

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    setProfilePhoto(newAvatarUrl);
    fetchCandidateProfile();
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

      setTimeout(() => {
        router.push('/candidate/profile');
      }, 800);
    } catch {
      // Error handled by onError callback
    }
  };

  // Load profile data on component mount (only once)
  useEffect(() => {
    fetchCandidateProfile();
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

              {/* Divider */}
              <hr className="self-stretch border-primary" />

              {/* Account Type */}
              <div className="self-stretch inline-flex justify-start items-start gap-24">
                <AccountTypeSection
                  selectedType={accountType}
                  onTypeChange={setAccountType}
                />
              </div>

              {/* Divider */}
              <hr className="self-stretch border-primary" />

              {/* Save Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="self-end inline-flex items-center justify-center gap-2 px-6 py-3 h-auto bg-[var(--bg-accent-solid,#4f46e5)] hover:opacity-90 rounded-[5px] font-label-label-1-semi-bold text-[length:var(--label-label-1-semi-bold-font-size)] text-[var(--text-white,#ffffff)] text-center tracking-[var(--label-label-1-semi-bold-letter-spacing)] leading-[var(--label-label-1-semi-bold-line-height)] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Login Details Tab Content */}
        <TabsContent
          value="login-details"
          className={`w-full min-h-[100%] flex flex-col items-end gap-6 bg-primary !mt-0${
            activeTab === 'login-details' ? ' px-8 pt-6 pb-8' : ''
          }`}
        >
          {/* Section Header */}
          <div className="self-stretch flex flex-col items-start gap-1">
            <h2 className="text-[20px] leading-6 font-['Lexend_Deca'] font-semibold text-primary">
              Basic Information
            </h2>
            <p className="text-base font-normal font-['Be_Vietnam_Pro'] text-tertiary">
              This is login information that you can update anytime.
            </p>
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Update Email Section */}
          <div className="self-stretch grid-cols-[260px_1fr] gap-4 md:grid md:grid-cols-[260px_1fr] md:gap-[117px] flex flex-col gap-6">
            {/* Left: Title & Desc */}
            <div className="flex flex-col gap-1">
              <div className="text-lg font-semibold font-['Lexend_Deca'] text-primary">
                Update Email
              </div>
              <div className="text-base wrap font-normal font-['Be_Vietnam_Pro'] text-tertiary">
                Update your email address to make sure it is safe
              </div>
            </div>
            {/* Right: Email verified + form */}
            <UpdateEmailForm email={email} />
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Change Password Section */}
          <div className="self-stretch grid-cols-[260px_1fr] gap-4 md:grid md:grid-cols-[260px_1fr] md:gap-[117px] flex flex-col gap-6 sm:flex-col">
            {/* Left: Title & Desc */}
            <div className="flex flex-col gap-1">
              <div className="text-lg font-semibold font-['Lexend_Deca'] text-primary">
                New Password
              </div>
              <div className="text-base font-normal font-['Be_Vietnam_Pro'] text-tertiary">
                Manage your password to make sure it is safe
              </div>
            </div>
            {/* Right: Password form */}
            <ChangePasswordForm />
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Close Account Button */}
          <Button className="flex flex-row items-center gap-2 px-6 py-3 bg-[var(--bg-error-secondary,#DC2626)] rounded-[5px] text-white font-semibold text-base font-['Lexend_Deca']">
            {/* Info Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
              <rect x="11" y="10" width="2" height="6" rx="1" fill="white" />
              <rect x="11" y="7" width="2" height="2" rx="1" fill="white" />
            </svg>
            Close Account
          </Button>
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
