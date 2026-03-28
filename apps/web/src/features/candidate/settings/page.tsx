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

type AccountType = 'job_seeker' | 'employer';

export default function CandidateSettingsPage() {
  const [activeTab, setActiveTab] = useState('my-profile');
  const [accountType, setAccountType] = useState<AccountType>('job_seeker');
  const [profilePhoto, setProfilePhoto] = useState<string>('https://placehold.co/124x124');
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsFormData>({
    firstName: 'Jake',
    lastName: 'Gyll',
    phoneNumber: '+44 1245 572 135',
    email: 'Jakegyll@gmail.com',
    dateOfBirth: '1997-08-09',
    gender: 'Male',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalDetailsFormData, string>>>({});

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

  return (
    <div className="min-h-screen bg-primary">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header Section with Tabs */}
        <div className="self-stretch px-8 pt-8 border-b border-primary">
          <SettingsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* My Profile Tab Content */}
        <TabsContent value="my-profile" className="self-stretch px-8 pt-6 pb-8 bg-primary flex flex-col justify-start items-end gap-6">
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
            <ProfilePhotoSection photoUrl={profilePhoto} onPhotoChange={handlePhotoChange} />
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
        <TabsContent value="login-details" className="self-stretch px-8 py-8 inline-flex flex-col justify-start items-start gap-6">
          <div className="text-center text-secondary">
            <p>Login details settings coming soon...</p>
          </div>
        </TabsContent>

        {/* System Settings Tab Content */}
        <TabsContent value="system-settings" className="self-stretch px-8 py-8 inline-flex flex-col justify-start items-start gap-6">
          <div className="text-center text-secondary">
            <p>System settings coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

