'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from './FormField';
import { authClient } from '@/lib/auth-client';
import {
  validatePassword,
  PASSWORD_REQUIREMENTS_TEXT,
} from '@/lib/password-validation';
import { toast } from 'sonner';

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldError, setOldError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOldError('');
    setNewError('');
    setConfirmError('');

    let valid = true;
    if (!oldPassword.trim()) {
      setOldError('Old password is required');
      valid = false;
    }
    if (!newPassword.trim()) {
      setNewError('New password is required');
      valid = false;
    } else if (!validatePassword(newPassword)) {
      setNewError(PASSWORD_REQUIREMENTS_TEXT);
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

    setIsLoading(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: oldPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        if (
          error.status === 401 ||
          error.message?.toLowerCase().includes('current password') ||
          error.code?.toLowerCase().includes('invalid_password')
        ) {
          setOldError('Incorrect current password');
        } else {
          toast.error(
            error.message || 'Failed to change password. Please try again.'
          );
        }
        return;
      }

      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[540px]">
      <FormField
        label="Old Password"
        type="password"
        value={oldPassword}
        onChange={setOldPassword}
        error={oldError}
        placeholder="Enter your old password"
        isRequired
        width="full"
        disabled={isLoading}
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
        disabled={isLoading}
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
        disabled={isLoading}
      />
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="self-start px-6 py-3 bg-[var(--bg-accent-solid,#4f46e5)] rounded-[5px] text-white font-semibold text-base font-['Lexend_Deca'] transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Changing Password...' : 'Change Password'}
      </Button>
    </div>
  );
}
