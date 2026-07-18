import { USER_ROLE, type UserRole } from '@/app/constants/role';

export function getDashboardPath(role?: string | null): string | null {
  switch (role) {
    case USER_ROLE.CANDIDATE:
      return '/pages/candidate/dashboard';

    case USER_ROLE.EMPLOYER:
      return '/pages/employer/dashboard';

    case USER_ROLE.ADMIN:
      return '/pages/admin/dashboard';

    default:
      return null;
  }
}

export type DashboardPath = NonNullable<ReturnType<typeof getDashboardPath>>;

export function isDashboardPath(value: unknown): value is DashboardPath {
  return (
    typeof value === 'string' &&
    (value === '/pages/candidate/dashboard' ||
      value === '/pages/employer/dashboard' ||
      value === '/pages/admin/dashboard')
  );
}

export type { UserRole };
