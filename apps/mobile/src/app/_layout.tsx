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
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { NAV_THEME } from '../lib/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authClient } from '../lib/auth-client';
import '../global.css';

const PUBLIC_ENTRY_ROUTES = new Set([
  '/',
  '/pages/(auth)/login',
  '/pages/(auth)/register',
  '/pages/(auth)/forgot-password',
]);

function getDashboardPathForRole(role: string | undefined): string | null {
  if (role === 'candidate') {
    return '/pages/candidate/dashboard';
  }

  if (role === 'employer') {
    return '/pages/employer/dashboard';
  }

  return null;
}

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
  const isPublicRoute = useMemo(
    () => PUBLIC_ENTRY_ROUTES.has(pathname),
    [pathname]
  );

  const tryResumeSession = useCallback(async () => {
    if (isCheckingSessionRef.current) {
      return;
    }

    if (!isPublicRoute) {
      setIsReady(true);
      return;
    }

    isCheckingSessionRef.current = true;

    try {
      const { data: session, error } = await authClient.getSession();

      if (error) {
        return;
      }

      const role = (session as SessionWithRole | null | undefined)?.user?.role;
      const nextPath = getDashboardPathForRole(role);

      if (nextPath && nextPath !== pathname) {
        router.replace(nextPath);
      }
    } finally {
      isCheckingSessionRef.current = false;
      setIsReady(true);
    }
  }, [isPublicRoute, pathname, router]);

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

  if (!isReady && isPublicRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return children;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

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
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
          <Toast position="top" topOffset={60} />
        </SessionResumeGate>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
