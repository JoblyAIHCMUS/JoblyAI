import { USER_ROLE } from '@/app/constants/role';

function getMetadataId(metadata: unknown, key: string): string | null {
  let parsedMetadata: Record<string, unknown> | null = null;

  if (typeof metadata === 'string') {
    try {
      const parsed: unknown = JSON.parse(metadata);
      parsedMetadata =
        parsed && typeof parsed === 'object'
          ? (parsed as Record<string, unknown>)
          : null;
    } catch {
      return null;
    }
  } else if (metadata && typeof metadata === 'object') {
    parsedMetadata = metadata as Record<string, unknown>;
  }

  const value = parsedMetadata?.[key];
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : null;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : null;
}

function getPathId(link: unknown, pattern: RegExp): string | null {
  if (typeof link !== 'string') {
    return null;
  }

  return link.match(pattern)?.[1] ?? null;
}

export function getNotificationRoute(
  type: string | undefined,
  metadata: unknown,
  role: string | undefined,
  link?: unknown,
  resourceId?: unknown
): string | null {
  if (!type || !role) {
    return null;
  }
  if (role !== USER_ROLE.CANDIDATE && role !== USER_ROLE.EMPLOYER) {
    return null;
  }

  switch (type) {
    case 'CHAT_MESSAGE': {
      const chatId = getString(resourceId) ?? getMetadataId(metadata, 'chatId');
      return chatId ? `/pages/${role}/messages/${chatId}` : null;
    }
    case 'NEW_APPLICATION': {
      const applicationId =
        getMetadataId(metadata, 'applicationId') ??
        getPathId(link, /^\/employer\/all-applications\/([^/?#]+)/);
      return role === USER_ROLE.EMPLOYER && applicationId
        ? `/pages/employer/all-applications/${applicationId}`
        : null;
    }
    case 'APPLICATION_SUBMITTED':
    case 'APPLICATION_STATUS_UPDATE':
    case 'APPLICATION_REJECTED': {
      const jobId =
        getMetadataId(metadata, 'jobId') ??
        getPathId(link, /^\/candidate\/find-jobs\/([^/?#]+)/);
      return role === USER_ROLE.CANDIDATE && jobId
        ? `/pages/find-jobs/${jobId}`
        : null;
    }

    default:
      return null;
  }
}
