import { USER_ROLE } from '@/app/constants/role';

export function canAccessRoute(
  pathname: string,
  role?: string,
) {
  if (!role) {
    return false;
  }

  if (
    pathname.startsWith('/pages/candidate')
  ) {
    return role === USER_ROLE.CANDIDATE;
  }

  if (
    pathname.startsWith('/pages/employer')
  ) {
    return role === USER_ROLE.EMPLOYER;
  }

  if (
    pathname.startsWith('/pages/admin')
  ) {
    return role === USER_ROLE.ADMIN;
  }

  return true;
}