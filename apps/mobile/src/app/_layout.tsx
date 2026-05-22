import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { NAV_THEME } from '../lib/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../global.css';

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
        <StatusBar style={currentColorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
        <Toast position="top" topOffset={60} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
