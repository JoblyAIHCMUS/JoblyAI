import { PortalHost } from '@rn-primitives/portal';
import { Stack, usePathname, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { NAV_THEME } from '../lib/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { SocketProvider } from '../contexts/SocketProvider';
import { authClient } from '../lib/auth-client';
import { NotificationManager } from '../components/NotificationManager';
import { canAccessRoute } from '@/utils/role-guard';
import { getDashboardPath } from '@/utils/auth-route';
import '../global.css';

const GUEST_ONLY_ROUTES = new Set([
  '/',
  '/pages/login',
  '/pages/register',
  '/pages/forgot-password',
  '/pages/find-jobs',
  '/pages/browse-companies',
]);

const PUBLIC_ROUTES = new Set(['/pages/find-jobs', '/pages/browse-companies']);

const PUBLIC_PREFIXES = ['/pages/find-jobs/', '/pages/browse-companies/'];
type SessionWithRole = {
  user?: {
    role?: string;
  };
};

function SessionResumeGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingSessionRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const isGuestOnly = GUEST_ONLY_ROUTES.has(pathname);

  const isPublic =
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const tryResumeSession = useCallback(async () => {
    if (isCheckingSessionRef.current) {
      return;
    }

    isCheckingSessionRef.current = true;

    try {
      const { data: session, error } = await authClient.getSession();

      if (error) {
        return;
      }
      // 1. Guest vào private
      if (!session && !isPublic && !isGuestOnly) {
        router.replace('/pages/login');
        return;
      }

      const role = (session as SessionWithRole | null | undefined)?.user?.role;

      // 2. Đã login nhưng vào login/register
      if (session && isGuestOnly) {
        const nextPath = getDashboardPath(role);

        if (nextPath && nextPath !== pathname) {
          router.replace(nextPath);
        }

        return;
      }

      // 3. Public page -> ai cũng được ở lại
      if (isPublic) {
        return;
      }

      // 4. Private page -> kiểm tra quyền
      const authorized = canAccessRoute(pathname, role);

      if (!authorized) {
        const nextPath = getDashboardPath(role);
        if (nextPath && nextPath !== pathname) {
          router.replace(nextPath);
        }

        return;
      }
    } finally {
      isCheckingSessionRef.current = false;
      setIsReady(true);
    }
  }, [isPublic, isGuestOnly, pathname, router]);

  useEffect(() => {
    void tryResumeSession();
  }, [tryResumeSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void tryResumeSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [tryResumeSession]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return children;
}

export default function AppLayout() {
  const currentColorScheme = colorScheme.get() ?? 'light';
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
