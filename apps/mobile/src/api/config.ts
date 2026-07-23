import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
  withCredentials: false,
});

// Mirror of better-auth/expo's `getCookie` helper. We re-implement it here so
// the request interceptor can `await` it (the upstream `authClient.getCookie()`
// is sync and depends on a sync SecureStore JSI shim that can return a
// Promise in some Android prod builds, which silently yields an empty cookie
// and triggers a 401 on the first post-login bootstrap call).
const SECURE_STORE_COOKIE_KEY = 'jobly_cookie';

function parseStoredCookieValue(raw: string | null): string {
  if (!raw) return '';
  let parsed: Record<string, { value: string; expires?: string }> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    return '';
  }
  const now = Date.now();
  return Object.entries(parsed)
    .filter(([, v]) => {
      if (!v?.value) return false;
      if (!v.expires) return true;
      return new Date(v.expires).getTime() > now;
    })
    .map(([k, v]) => `${k}=${v.value}`)
    .join('; ');
}

async function readSessionCookieHeader(): Promise<string> {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_STORE_COOKIE_KEY);
    return parseStoredCookieValue(raw);
  } catch {
    // Fall back to the upstream sync getter if the async read throws for
    // any reason (e.g. SecureStore unavailable on a weird platform).
    const client = authClient as unknown as { getCookie?: () => string };
    return client.getCookie?.() ?? '';
  }
}

apiClient.interceptors.request.use(async (config) => {
  const cookies = await readSessionCookieHeader();

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url ?? '';
    // Skip auth-related endpoints (sign-in/up/out, session) and known
    // post-login bootstrap calls. A 401 on `/devices/register` in
    // particular must NOT nuke the session — it fires immediately after
    // the user dismisses the Android 13+ notification permission dialog,
    // where the freshly-minted session can race with the server-side
    // session cache. Nuking here would bounce the user from the
    // dashboard back to the login page. If the session really is gone,
    // the next real API call (candidate profile, applications, etc.)
    // will still catch it.
    const skipUrl =
      requestUrl.includes('/auth/') || requestUrl.includes('/devices/register');

    if (!axios.isAxiosError(error) || handlingAuthError || skipUrl) {
      if (
        requestUrl.includes('/devices/register') &&
        error.response?.status === 401
      ) {
        console.warn(
          '[api] Ignoring 401 on /devices/register (post-login bootstrap call)'
        );
      }
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401 && status !== 403) {
      return Promise.reject(error);
    }

    handlingAuthError = true;
    try {
      if (status === 401) {
        // Session is gone server-side. Best-effort sign out — local state
        // must be cleared even if the server's /sign-out is unreachable.
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
