import { USER_ROLE } from '@/app/constants/role';

export function getNotificationRoute(
  type: string | undefined,
  resourceId: string | undefined,
  role: string | undefined,
): string | null {
  if (!type || !resourceId || !role) {
    return null;
  }
  if (role !== USER_ROLE.CANDIDATE && role !== USER_ROLE.EMPLOYER) {
    return null;
  }
  if (type === 'CHAT_MESSAGE' && !resourceId) {
    return null;
  }
  switch (type) {
    case 'CHAT_MESSAGE':
      return role === USER_ROLE.CANDIDATE
        ? `/pages/candidate/messages/${resourceId}`
        : `/pages/employer/messages/${resourceId}`;

    default:
      return null;
  }
}