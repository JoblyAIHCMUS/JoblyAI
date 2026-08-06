'use client';

import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from '../../../components/shared/TextInput';
import { Button } from '../../../../components/ui/button';
import { Text } from '../../../../components/ui/text';
import { useResetPassword } from '../../../../hooks/useAuth';
import { authClient } from '../../../../lib/auth-client';

import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/theme';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';

const ForgotPasswordPage = () => {
  const {
    resetPassword,
    loading: resetLoading,
    error: resetError,
  } = useResetPassword();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<Error | null>(null);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (resendTimer > 0) return;

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email,
      });

      if (error) {
        throw error;
      }

      setOtpSent(true);
      setResendTimer(60);
      setOtp('');
      Alert.alert(
        'Success',
        'Verification code sent to your email. Check your inbox.'
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send verification code';
      setOtpError(err instanceof Error ? err : new Error(message));
      Alert.alert('Error', message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await resetPassword({
        email,
        otp,
        password: newPassword,
      });

      Alert.alert(
        'Success',
        'Password reset successful! Redirecting to login...'
      );
      router.replace('/pages/(auth)/login');
    } catch {
      Alert.alert(
        'Error',
        resetError?.message || 'Failed to reset password. Please try again.'
      );
    }
  };

  const error = otpError || resetError;
  const loading = otpLoading || resetLoading;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareView className="flex-1">
        <ScrollView className="flex-grow" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6 px-6 py-8">
          <View className="flex-1">
            <Text variant="h1" className="text-left mb-2">
              Reset Password
            </Text>
            <Text variant="muted" className="text-sm">
              Enter your email to receive a verification code
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/pages/(auth)/login')}>
            <Text className="text-sm font-semibold text-indigo-700">Login</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-destructive/10 rounded-lg p-4 mb-4 border-l-4 border-destructive mx-6">
            <Text className="text-destructive text-sm">{error.message}</Text>
          </View>
        )}

        {/* Form */}
        <View className="flex-1 px-6 py-4">
          {/* Email Input */}
          <TextInput
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading && !otpSent}
          />

          {/* OTP Input */}
          {otpSent && (
            <View className="gap-4">
              <TextInput
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={(text) => setOtp(text.slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              {/* New Password */}
              <TextInput
                label="New Password"
                placeholder="Enter your new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={!loading}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color={COLORS.slate500} />
                    ) : (
                      <Eye size={20} color={COLORS.slate500} />
                    )}
                  </TouchableOpacity>
                }
              />

              {/* Confirm Password */}
              <TextInput
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={COLORS.slate500} />
                    ) : (
                      <Eye size={20} color={COLORS.slate500} />
                    )}
                  </TouchableOpacity>
                }
              />

              {/* Password Match Indicator */}
              {newPassword && confirmPassword && (
                <View
                  className={`rounded p-3 ${
                    newPassword === confirmPassword
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      newPassword === confirmPassword
                        ? 'text-green-700'
                        : 'text-red-600'
                    }`}
                  >
                    {newPassword === confirmPassword ? (
                      <View className="flex-row items-center">
                        <Check
                          size={12}
                          color={COLORS.successDark}
                          strokeWidth={3}
                          className="mr-1"
                        />
                        <Text className="text-green-700">Passwords match</Text>
                      </View>
                    ) : (
                      '✗ Passwords do not match'
                    )}
                  </Text>
                </View>
              )}

              {/* Reset Button */}
              <Button
                size="lg"
                className={'bg-indigo-700'}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text>
                  {loading ? 'Resetting password...' : 'Reset Password'}
                </Text>
              </Button>

              {/* Resend OTP */}
              <View className="flex-row justify-center mt-4">
                <Text variant="muted" className="text-sm">
                  Didn't receive a code?{' '}
                </Text>
                <TouchableOpacity
                  onPress={handleSendOTP}
                  disabled={resendTimer > 0 || loading}
                >
                  <Text
                    className={`text-sm font-semibold text-indigo-700 ${
                      (resendTimer > 0 || loading) && 'opacity-50'
                    }`}
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Send OTP Button */}
          {!otpSent && (
            <Button
              className={'bg-indigo-700'}
              size="lg"
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text>
                {loading ? 'Sending code...' : 'Send Verification Code'}
              </Text>
            </Button>
          )}

          {/* Back to Login */}
          <View className="mt-8 items-center">
            <TouchableOpacity
              onPress={() => router.push('/pages/(auth)/login')}
              className="flex-row items-center"
            >
              <ArrowLeft
                size={16}
                color={COLORS.indigoStrong}
                className="mr-2"
              />
              <Text className="text-sm font-semibold text-indigo-700">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAwareView>
    </SafeAreaView>
  );
};

export default ForgotPasswordPage;
