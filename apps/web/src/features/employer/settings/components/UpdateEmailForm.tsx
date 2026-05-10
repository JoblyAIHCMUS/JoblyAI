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
    <div className="flex flex-col gap-5 w-full max-w-[540px]">
      <div className="flex flex-row items-center gap-2">
        <span className="text-base font-medium font-['Be_Vietnam_Pro'] text-primary">
          {email}
        </span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      <div className="text-sm text-secondary font-normal font-['Be_Vietnam_Pro']">
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
        {success && <span className="text-sm text-green-600">{success}</span>}
        <Button
          type="submit"
          className="self-start mt-2 px-6 py-3 bg-[var(--bg-accent-solid,#4f46e5)] rounded-[5px] text-white font-semibold text-base font-['Lexend_Deca']"
        >
          Update Email
        </Button>
      </form>
    </div>
  );
}
