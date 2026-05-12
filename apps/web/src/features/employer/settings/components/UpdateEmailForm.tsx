/* Copied from candidate/settings/components/UpdateEmailForm.tsx */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from './FormField';

interface UpdateEmailFormProps {
  email: string;
}

export default function UpdateEmailForm({ email }: UpdateEmailFormProps) {
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) =>
    /^[\w.-]+@[\w-]+\.[A-Za-z]{2,}$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setSuccess('');
    if (!newEmail.trim()) {
      setEmailError('Email is required');
      return;
    } else if (!validateEmail(newEmail)) {
      setEmailError('Invalid email format');
      return;
    }
    // TODO: Call API to update email
    setSuccess('Email updated successfully!');
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span className="text-xs sm:text-sm md:text-base font-medium font-['Be_Vietnam_Pro'] text-primary break-all">
          {email}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
        >
          <circle cx="12" cy="12" r="10" fill="#22C55E" />
          <path
            d="M8 12.5L11 15.5L16 10.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-xs sm:text-sm text-secondary font-normal font-['Be_Vietnam_Pro']">
        Your email address is verified.
      </div>
      <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
        <FormField
          label="Update Email"
          type="email"
          value={newEmail}
          onChange={setNewEmail}
          error={emailError}
          placeholder="Enter your new email"
          isRequired
          width="full"
        />
        {success && (
          <span className="text-xs sm:text-sm text-green-600">{success}</span>
        )}
        <Button
          type="submit"
          className="self-start mt-2 px-3 sm:px-6 py-2 sm:py-3 h-9 sm:h-10 text-xs sm:text-sm bg-[var(--bg-accent-solid,#4f46e5)] rounded-[5px] text-white font-semibold font-['Lexend_Deca'] hover:opacity-90 transition-opacity"
        >
          Update Email
        </Button>
      </form>
    </div>
  );
}
