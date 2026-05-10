export const SETTINGS_TABS = [
  { id: 'my-profile', label: 'My Profile' },
  { id: 'system-settings', label: 'System Settings' },
];

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'] as const;

export const ACCOUNT_TYPES = {
  JOB_SEEKER: 'job_seeker' as const,
  EMPLOYER: 'employer' as const,
};
