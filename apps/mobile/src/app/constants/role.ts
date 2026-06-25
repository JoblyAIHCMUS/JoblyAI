export const USER_ROLE = {
  CANDIDATE: 'candidate',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
} as const;

export type UserRole =
  (typeof USER_ROLE)[keyof typeof USER_ROLE];