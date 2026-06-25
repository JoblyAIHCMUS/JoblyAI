import { USER_ROLE } from '@/app/constants/role';

export function getDashboardPath(role?: string) {
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
