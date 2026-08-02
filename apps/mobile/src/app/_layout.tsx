import { PortalHost } from '@rn-primitives/portal';
import {
  Stack,
  usePathname,
  useRootNavigationState,
  useRouter,
} from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { type ReactNode, useEffect } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { NAV_THEME } from '../lib/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { SocketProvider } from '../contexts/SocketProvider';
import { useAuth } from '../hooks/useAuth';
import { NotificationManager } from '../components/NotificationManager';
import FloatingTabNavigation from './components/FloatingTabNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SidebarVisibilityProvider } from '../contexts/SidebarContext';
import { canAccessRoute } from '@/utils/role-guard';
import { getDashboardPath } from '@/utils/auth-route';
import '../global.css';

const GUEST_ONLY_ROUTES = new Set([
  '/',
  '/pages/login',
  '/pages/register',
  '/pages/forgot-password',
]);

const PUBLIC_ROUTES = new Set(['/pages/find-jobs', '/pages/browse-companies']);

const PUBLIC_PREFIXES = ['/pages/find-jobs/', '/pages/browse-companies/'];

function SessionResumeGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const isGuestOnly = GUEST_ONLY_ROUTES.has(pathname);

  const isPublic =
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Single source of truth for the session, role, and refetch.
  const { session, isPending, refetch, role } = useAuth();
  const isAuthenticated = Boolean(session);

  // Single source of truth for routing based on the current session.
  // Re-runs whenever the session, the pathname, or the route class changes,
  // so role downgrades, logouts, and login-as-different-role all get caught
  // without needing a full app restart.
  //
  // The Stack navigator is always rendered below (we never block the
  // children with an early-return spinner). Because imperative navigation can
  // still run before the navigator container is fully ready, we guard on the
  // root navigation state and retry with a short backoff.
  useEffect(() => {
    // Wait until the root navigator is actually mounted. Expo Router's
    // useRouter actions throw if the navigation container isn't ready yet.
    const navigatorReady =
      !!rootNavigationState?.key &&
      Array.isArray(rootNavigationState.routes) &&
      rootNavigationState.routes.length > 0;
    if (isPending || !navigatorReady) {
      return;
    }

    const performNavigation = (attempt: number) => {
      try {
        // 1. Guest and private -> bounce to login
        if (!isAuthenticated && !isPublic && !isGuestOnly) {
          router.replace('/pages/login');
          return;
        }

        // 2. Logged in but on login/register -> go to the right dashboard
        if (isAuthenticated && isGuestOnly) {
          const nextPath = getDashboardPath(role);
          if (nextPath && nextPath !== pathname) {
            router.replace(nextPath);
          }
          return;
        }

        // 3. Public page -> anyone can stay
        if (isPublic) {
          return;
        }

        // 4. Private page -> role check
        const authorized = canAccessRoute(pathname, role ?? undefined);
        if (!authorized) {
          const nextPath = getDashboardPath(role);
          if (nextPath && nextPath !== pathname) {
            router.replace(nextPath);
          }
        }
      } catch {
        if (attempt < 5) {
          scheduleNavigation(attempt + 1);
        }
      }
    };

    const scheduleNavigation = (attempt: number) => {
      return setTimeout(() => performNavigation(attempt), attempt * 50);
    };

    const timer = scheduleNavigation(0);
    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    isPending,
    isPublic,
    isGuestOnly,
    pathname,
    role,
    router,
    rootNavigationState,
  ]);

  // Re-validate when the app comes back to the foreground. The session may
  // have been revoked server-side while the app was backgrounded.
  //
  // We debounce by 500ms and coalesce in-flight refetches so the foreground
  // event triggered by the Android 13+ notification permission dialog
  // dismissal doesn't race with the in-flight `registerDevice()` call. If
  // the session actually changed while the app was backgrounded, a 500ms
  // delay is imperceptible and the next real API call will catch it.
  useEffect(() => {
    const refetchTimeoutRef = {
      current: null as ReturnType<typeof setTimeout> | null,
    };
    const inFlightRef = { current: false };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;

      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      refetchTimeoutRef.current = setTimeout(() => {
        refetchTimeoutRef.current = null;
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        void refetch().finally(() => {
          inFlightRef.current = false;
        });
      }, 500);
    });

    return () => {
      subscription.remove();
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
    };
  }, [refetch]);

  // Always render children so the Stack navigator is mounted on the first
  // render. While the session is being resolved, overlay a spinner that
  // blocks stray taps so the user doesn't interact with content before we
  // know whether to redirect them.
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SidebarVisibilityProvider>
          {children}
          <FloatingTabNavigation />
        </SidebarVisibilityProvider>
      </GestureHandlerRootView>
      {isPending && (
        <View
          pointerEvents="auto"
          className="absolute inset-0 z-50 items-center justify-center bg-background"
        >
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}
    </>
  );
}

export default function AppLayout() {
  const currentColorScheme = 'light' as const;
  const baseTheme = currentColorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme: Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...NAV_THEME[currentColorScheme],
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <SessionResumeGate>
          <StatusBar style={currentColorScheme === 'dark' ? 'light' : 'dark'} />
          <SocketProvider>
            <NotificationManager />
            <Stack screenOptions={{ headerShown: false }} />
            <PortalHost />
            <Toast position="top" topOffset={60} />
          </SocketProvider>
        </SessionResumeGate>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
