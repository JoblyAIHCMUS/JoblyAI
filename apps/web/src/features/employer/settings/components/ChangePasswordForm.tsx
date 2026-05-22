/* Copied from candidate/settings/components/ChangePasswordForm.tsx */
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from './FormField';

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldError, setOldError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (pw: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      pw
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOldError('');
    setNewError('');
    setConfirmError('');
    setSuccess('');
    let valid = true;
    if (!oldPassword.trim()) {
      setOldError('Old password is required');
      valid = false;
    }
    if (!newPassword.trim()) {
      setNewError('New password is required');
      valid = false;
    } else if (!validatePassword(newPassword)) {
      setNewError(
        'Password must be at least 8 characters, include upper, lower, number, special character'
      );
      valid = false;
    }
    if (!confirmPassword.trim()) {
      setConfirmError('Confirm password is required');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    }
    if (!valid) return;
    // TODO: Call API to change password
    setSuccess('Password changed successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full">
      <FormField
        label="Old Password"
        type="password"
        value={oldPassword}
        onChange={setOldPassword}
        error={oldError}
        placeholder="Enter your old password"
        isRequired
        width="full"
      />
      <FormField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={setNewPassword}
        error={newError}
        placeholder="Enter your new password"
        isRequired
        width="full"
      />
      <FormField
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={confirmError}
        placeholder="Re-enter your new password"
        isRequired
        width="full"
      />
      {success && (
        <span className="text-xs sm:text-sm text-green-600">{success}</span>
      )}
      <Button
        type="button"
        onClick={handleSubmit}
        className="self-start px-3 sm:px-6 py-2 sm:py-3 h-9 sm:h-10 text-xs sm:text-sm bg-[var(--bg-accent-solid,#4f46e5)] rounded-[5px] text-white label-label-2-semi-bold sm:label-label-1-semi-bold transition-opacity hover:opacity-90"
      >
        Change Password
      </Button>
    </div>
  );
}
