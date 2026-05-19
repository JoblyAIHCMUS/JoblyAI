import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useUser } from '../../../hooks/useUser';
import { getPostAuthRoute } from '../../../lib/auth-redirect';

export default function AuthLayout() {
  const router = useRouter();
  const { data: user, isLoading, isSuccess } = useUser();

  useEffect(() => {
    if (!isSuccess || !user) {
      return;
    }

    router.replace(getPostAuthRoute(user));
  }, [isSuccess, router, user]);

  if (isLoading || (isSuccess && user)) {
    return <View className="flex-1 bg-background" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}