'use client';

import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  SettingsTabs,
  ProfilePhotoSection,
  PersonalDetailsForm,
  AccountTypeSection,
  type PersonalDetailsFormData,
} from './components';
import UpdateEmailForm from './components/UpdateEmailForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import { NotificationOptions } from './components/NotificationOptions';

type AccountType = 'job_seeker' | 'employer';

export default function CandidateSettingsPage() {
  const [activeTab, setActiveTab] = useState('my-profile');
  const [accountType, setAccountType] = useState<AccountType>('job_seeker');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    'https://placehold.co/124x124'
  );
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetailsFormData>({
      firstName: 'Jake',
      lastName: 'Gyll',
      phoneNumber: '+44 1245 572 135',
      email: 'Jakegyll@gmail.com',
      dateOfBirth: '1997-08-09',
      gender: 'Male',
    });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PersonalDetailsFormData, string>>
  >({});

  const tabs = [
    { id: 'my-profile', label: 'My Profile' },
    { id: 'login-details', label: 'Login Details' },
    { id: 'system-settings', label: 'System Settings' },
  ];

  const handlePhotoChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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

  const handleSave = () => {
    if (validateForm()) {
      console.log('Saving profile...', {
        accountType,
        profilePhoto,
        personalDetails,
      });
      // TODO: Send data to API
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
              onPhotoChange={handlePhotoChange}
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
            />
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
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 h-auto bg-[var(--bg-accent-solid,#4f46e5)] hover:opacity-90 rounded-[5px] font-label-label-1-semi-bold text-[length:var(--label-label-1-semi-bold-font-size)] text-[var(--text-white,#ffffff)] text-center tracking-[var(--label-label-1-semi-bold-letter-spacing)] leading-[var(--label-label-1-semi-bold-line-height)] whitespace-nowrap"
          >
            Save Profile
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
            <UpdateEmailForm email={personalDetails.email} />
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
            notifications={notifications}
            onChange={handleNotificationChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
