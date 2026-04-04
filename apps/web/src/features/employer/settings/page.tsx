'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  SettingsTabs,
  ProfilePhotoSection,
  PersonalDetailsForm,
  AccountTypeSection,
  type PersonalDetailsFormData,
} from './components';
import ChangePasswordForm from './components/ChangePasswordForm';
import UpdateEmailForm from './components/UpdateEmailForm';
import { NotificationOptions } from './components/NotificationOptions';
import { useGetEmployerProfile } from '@/api-hook/employer';
import { useUpdatePersonalDetails } from '@/api-hook/user/useUpdatePersonalDetails';
import { useUploadFile } from '@/api-hook/s3';
import { useToast } from '@/hooks/useToast';
import { formatErrorForDisplay } from '@/lib/errors';
import { formatDateToYYYYMMDD } from '@/lib/validation';

type AccountType = 'job_seeker' | 'employer';

export default function EmployerSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-profile');
  const [accountType, setAccountType] = useState<AccountType>('employer');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    'https://placehold.co/124x124'
  );
  const [email, setEmail] = useState<string>('');
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetailsFormData>({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '',
      gender: '',
    });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PersonalDetailsFormData, string>>
  >({});

  const { fetchEmployerProfile, loading: loadingProfile } =
    useGetEmployerProfile({
      onSuccess: (data) => {
        setEmail(data.email || '');
        setProfilePhoto(
          data.avatarUrl || data.image || 'https://placehold.co/124x124'
        );
        setPersonalDetails((prev) => ({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber ?? prev.phoneNumber,
          email: data.email || '',
          dateOfBirth: formatDateToYYYYMMDD(
            data.dateOfBirth ?? prev.dateOfBirth
          ),
          gender: data.gender ?? prev.gender,
        }));
      },
      onError: (error) => {
        toast.error(
          formatErrorForDisplay(error, 'Failed to load employer profile')
        );
      },
    });

  const { updateDetails, loading: updatingProfile } =
    useUpdatePersonalDetails();
  const { upload, loading: uploadingAvatar } = useUploadFile();

  const tabs = [
    { id: 'my-profile', label: 'My Profile' },
    { id: 'login-details', label: 'Login Details' },
    { id: 'system-settings', label: 'System Settings' },
  ];

  useEffect(() => {
    fetchEmployerProfile();
  }, []);

  const handlePhotoChange = async (file: File) => {
    try {
      const uploadResult = await upload(file, 'avatars');
      await updateDetails({ avatarUrl: uploadResult.fileUrl });
      setProfilePhoto(uploadResult.fileUrl);
      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error(
        formatErrorForDisplay(error, 'Failed to update profile photo')
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!personalDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!personalDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!personalDetails.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!personalDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!personalDetails.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    if (!personalDetails.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!personalDetails.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateDetails({
        firstName: personalDetails.firstName,
        lastName: personalDetails.lastName,
        phoneNumber: personalDetails.phoneNumber,
        dateOfBirth: personalDetails.dateOfBirth,
        gender: personalDetails.gender,
      });
      await fetchEmployerProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(
        formatErrorForDisplay(error, 'Failed to update profile details')
      );
    }
  };

  // Notification state
  const [notifications, setNotifications] = useState({
    applications: true,
    jobs: false,
    recommendations: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSaving = updatingProfile || uploadingAvatar;

  return (
    <div className="min-h-screen bg-primary">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header Section with Tabs */}
        <div className="self-stretch px-8 pt-8 border-b border-primary">
          <SettingsTabs
            tabs={tabs}
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
          {/* Section Header */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <h2 className="heading-h5-semi-bold text-primary">
              Basic Information
            </h2>
            <p className="body-body-1-regular text-tertiary">
              This is your personal information that you can update anytime.
            </p>
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Profile Photo */}
          <div className="self-stretch inline-flex justify-start items-start gap-28">
            <ProfilePhotoSection
              photoUrl={profilePhoto}
              onPhotoChange={handlePhotoChange}
              disabled={loadingProfile || isSaving}
            />
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Personal Details Form */}
          <div className="self-stretch inline-flex justify-start items-start gap-60">
            <PersonalDetailsForm
              data={personalDetails}
              onChange={setPersonalDetails}
              errors={errors}
              disabled={loadingProfile || isSaving}
            />
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Account Type */}
          <div className="self-stretch inline-flex justify-start items-start gap-24">
            <AccountTypeSection
              selectedType={accountType}
              onTypeChange={setAccountType}
              disabled
            />
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loadingProfile || isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 h-auto bg-[var(--bg-accent-solid,#4f46e5)] hover:opacity-90 rounded-[5px] font-label-label-1-semi-bold text-[length:var(--label-label-1-semi-bold-font-size)] text-[var(--text-white,#ffffff)] text-center tracking-[var(--label-label-1-semi-bold-letter-spacing)] leading-[var(--label-label-1-semi-bold-line-height)] whitespace-nowrap"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
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
            <h2 className="heading-h6-semi-bold text-primary">
              Basic Information
            </h2>
            <p className="body-body-1-regular text-tertiary">
              This is login information that you can update anytime.
            </p>
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Update Email Section */}
          <div className="self-stretch grid-cols-[260px_1fr] gap-4 md:grid md:grid-cols-[260px_1fr] md:gap-[117px] flex flex-col">
            {/* Left: Title & Desc */}
            <div className="flex flex-col gap-1">
              <div className="heading-h6-semi-bold text-primary">
                Update Email
              </div>
              <div className="body-body-1-regular text-tertiary">
                Update your email address to make sure it is safe
              </div>
            </div>
            {/* Right: Email verified + form */}
            <UpdateEmailForm email={email || personalDetails.email} />
          </div>

          {/* Divider */}
          <hr className="self-stretch border-primary" />

          {/* Change Password Section */}
          <div className="self-stretch grid-cols-[260px_1fr] gap-4 md:grid md:grid-cols-[260px_1fr] md:gap-[117px] flex flex-col sm:flex-col">
            {/* Left: Title & Desc */}
            <div className="flex flex-col gap-1">
              <div className="heading-h6-semi-bold text-primary">
                New Password
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

          {/* Close Account Button */}
          <Button className="flex flex-row items-center gap-2 px-6 py-3 bg-[var(--bg-error-secondary,#DC2626)] rounded-[5px] text-white label-label-1-semi-bold">
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
            <h2 className="heading-h6-semi-bold text-primary">
              Basic Information
            </h2>
            <p className="body-body-1-regular text-tertiary">
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
            notifications={notifications}
            onChange={handleNotificationChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
