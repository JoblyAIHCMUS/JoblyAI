import axios from 'axios';
import { router } from 'expo-router';
import { authClient } from '../lib/auth-client';
import { API_BASE_URL } from '../lib/api-base';
import { getSession, invalidateSession, clearLocalSession } from '../lib/auth';
import { getDashboardPath } from '@/utils/auth-route';
import type { UserRole } from '@/app/constants/role';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for cookie-based auth
});

apiClient.interceptors.request.use(async (config) => {
  const client = authClient as unknown as { getCookie?: () => string };
  const cookies = client.getCookie?.() ?? '';

  if (cookies) {
    config.headers = config.headers ?? {};

    if (typeof config.headers.set === 'function') {
      config.headers.set('Cookie', cookies);
    } else {
      config.headers.Cookie = cookies;
    }
  }

  return config;
});

/**
 * 401 vs 403 contract (kept in sync with apps/web/src/lib/api.ts and
 * apps/web/src/proxy.ts):
 *   401 = session is gone. Sign out, clear cached profile queries, redirect
 *         to "/".
 *   403 = session is still valid, but the role doesn't match the resource.
 *         Re-route to the user's role-specific dashboard, keep the session.
 *         DO NOT sign the user out — the cookie is good; only the screen is
 *         wrong.
 * In both cases, dismiss the navigation stack down to root + replace so the
 * screen that fired the request is unmounted instead of continuing to refire
 * with the now-stale/role-mismatched cookie.
 */
let handlingAuthError = false;

let lastLoginAt = 0;
const POST_LOGIN_GRACE_MS = 30_000;
const RETRY_DELAY_MS = 1000;

const SKIP_AUTH_REDIRECT_URLS = ['/auth/', '/devices/register'];

export function markLogin(): void {
  lastLoginAt = Date.now();
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      !axios.isAxiosError(error) ||
      handlingAuthError ||
      SKIP_AUTH_REDIRECT_URLS.some((path) => error.config?.url?.includes(path))
    ) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401 && status !== 403) {
      return Promise.reject(error);
    }

    handlingAuthError = true;
    try {
      if (status === 401) {
        const inGrace = Date.now() - lastLoginAt < POST_LOGIN_GRACE_MS;
        const alreadyRetried = error.config.__authRetried === true;
        if (inGrace && !alreadyRetried) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          try {
            const retryConfig = { ...error.config, __authRetried: true };
            const retried = await apiClient.request(retryConfig);
            handlingAuthError = false;
            return retried;
          } catch {
            /* retry failed — fall through to invalidation */
          }
        }
        try {
          await invalidateSession();
        } catch {
          /* signOut is best-effort */
        }
        router.dismissAll();
        router.replace('/');
      } else {
        // 403 — the cookie is still good; we just hit a screen that the
        // current role isn't allowed on. Read the cached session (Better
        // Auth keeps this in SecureStore on native, so this is a sync read
        // and won't fail just because we're offline) and bounce to the
        // role's dashboard.
        let nextPath = '/';
        try {
          const session = await getSession();
          const role = (session?.user as { role?: UserRole } | undefined)?.role;
          nextPath = getDashboardPath(role) ?? '/';
        } catch {
          // If we can't read the session for any reason, fall back to "/".
          // We deliberately do NOT sign out here — the user is still
          // authenticated, just on the wrong screen.
          nextPath = '/';
        }
        router.dismissAll();
        router.replace(nextPath);
      }
    } finally {
      // Reset the latch after a short cooldown so a real 401/403 after the
      // redirect (e.g. a fresh login attempt that returns 401) can still be
      // handled.
      setTimeout(() => {
        handlingAuthError = false;
      }, 2000);
    }
    return Promise.reject(error);
  }
);

export { clearLocalSession };
