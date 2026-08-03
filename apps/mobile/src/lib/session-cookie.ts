import * as SecureStore from 'expo-secure-store';
import { authClient } from './auth-client';

const SECURE_STORE_COOKIE_KEY = 'jobly_cookie';

function parseStoredCookieValue(
  raw: string | null
): string {
  if (!raw) {
    return '';
  }

  let parsed: Record<string, { value: string; expires?: string }> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    return '';
  }

  const now = Date.now();
  return Object.entries(parsed)
    .filter(([, value]) => {
      if (!value?.value) {
        return false;
      }
      if (!value.expires) {
        return true;
      }
      return new Date(value.expires).getTime() > now;
    })
    .map(([key, value]) => `${key}=${value.value}`)
    .join('; ');
}

export async function getSessionCookieHeader(): Promise<string> {
  try {
    return parseStoredCookieValue(
      await SecureStore.getItemAsync(SECURE_STORE_COOKIE_KEY)
    );
  } catch {
    const client = authClient as unknown as { getCookie?: () => string };
    return client.getCookie?.() ?? '';
  }
}
