'use client';

import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { TextInput } from '../../../components/shared/TextInput';
import { Button } from '../../../../components/ui/button';
import { Text } from '../../../../components/ui/text';
import {
  GoogleAuthButton,
  AuthDivider,
} from '../../../components/shared/GoogleAuthButton';
import { useLogin } from '../../../../hooks/useAuth';
import { router } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';

import { Eye, EyeOff, Check } from 'lucide-react-native';

const LoginPage = () => {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });

      if (error) {
        throw error;
      }

      const { data: session } = await authClient.getSession();
      const role = (session?.user as { role?: string } | undefined)?.role;

      if (role === 'employer') {
        router.replace('/pages/employer/dashboard');
      } else if (role === 'candidate') {
        router.replace('/pages/candidate/dashboard');
      } else {
        router.replace('/');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2:
          error instanceof Error
            ? error.message
            : 'Unable to complete Google sign-in',
      });
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email address',
      });
      return;
    }

    if (!password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your password',
      });
      return;
    }

    try {
      const result = await login({ email, password, rememberMe });

      // Role-based redirect
      if (result.user.role === 'employer') {
        router.push('/pages/employer/dashboard');
      } else if (result.user.role === 'candidate') {
        router.push('/pages/candidate/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2:
          err instanceof Error
            ? err.message
            : 'An error occurred during login. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-grow"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-6 py-8">
          <Text variant="h1" className="text-left mb-2">
            Welcome Back
          </Text>
        </View>

        {/* Google Login */}
        <View className="px-6 text-indigo-700">
          <GoogleAuthButton
            label="Log in with Google"
            onPress={handleGoogleLogin}
          />
        </View>

        <View className="px-6">
          <AuthDivider text="Or login with email" />
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-destructive/10 rounded-lg p-4 mb-6 border-l-4 border-destructive mx-6">
            <Text className="text-destructive text-sm font-medium">
              {error.message}
            </Text>
          </View>
        )}

        {/* Form Fields */}
        <View className="px-6">
          {/* Email Input */}
          <TextInput
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <View className="h-2" />

          {/* Password Input */}
          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#64748b" />
                ) : (
                  <Eye size={20} color="#64748b" />
                )}
              </TouchableOpacity>
            }
          />

          {/* Remember Me & Forgot Password */}
          <View className="flex-row justify-between items-center mt-4 mb-8">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 border-2 rounded items-center justify-center mr-2 ${
                  rememberMe
                    ? 'border-primary bg-indigo-700'
                    : 'border-input bg-background'
                }`}
              >
                {rememberMe && (
                  <Check size={12} color="white" strokeWidth={3} />
                )}
              </View>
              <Text className="text-md font-medium text-foreground">
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/pages/(auth)/forgot-password')}
              activeOpacity={0.7}
            >
              <Text className="text-md font-semibold text-indigo-700">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            className="text-white bg-indigo-700 font-bold"
            size="lg"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text>{loading ? 'Logging in...' : 'Login'}</Text>
          </Button>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-lg text-muted-foreground">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/pages/(auth)/register')}
              activeOpacity={0.7}
            >
              <Text className="text-lg font-bold text-indigo-700">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginPage;
