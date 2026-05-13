import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
      <Toast position="top" topOffset={60} />
    </SafeAreaProvider>
  );
}
