'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../../constants/theme';
import { TextInput } from '../../../components/shared/TextInput';
import { AppButton } from '../../../components/shared/AppButton';
import { useSendOTP, useResetPassword } from '../../../../hooks/useAuth';

interface ForgotPasswordPageProps {
  onGoToLanding?: () => void;
  onGoToLogin?: () => void;
}

const ForgotPasswordPage = ({
  onGoToLanding,
  onGoToLogin,
}: ForgotPasswordPageProps) => {
  const { sendOTP, loading: otpLoading, error: otpError } = useSendOTP();
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

    try {
      await sendOTP({ email, type: 'forget-password' });
      setOtpSent(true);
      setResendTimer(60);
      setOtp('');
      Alert.alert(
        'Success',
        'Verification code sent to your email. Check your inbox.'
      );
    } catch {
      Alert.alert(
        'Error',
        otpError?.message || 'Failed to send verification code'
      );
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
      onGoToLogin?.();
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => onGoToLanding?.()}>
            <View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email to receive a verification code
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onGoToLogin?.()}>
            <Text style={styles.headerLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading && !otpSent}
          />

          {/* OTP Input */}
          {otpSent && (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={(text) => setOtp(text.slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              {/* New Password */}
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Text>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {newPassword && confirmPassword && (
                <View
                  style={[
                    styles.matchIndicator,
                    newPassword === confirmPassword
                      ? styles.matchIndicatorSuccess
                      : styles.matchIndicatorError,
                  ]}
                >
                  <Text
                    style={[
                      styles.matchIndicatorText,
                      newPassword === confirmPassword
                        ? styles.matchIndicatorTextSuccess
                        : styles.matchIndicatorTextError,
                    ]}
                  >
                    {newPassword === confirmPassword
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'}
                  </Text>
                </View>
              )}

              {/* Reset Button */}
              <AppButton
                title={loading ? 'Resetting password...' : 'Reset Password'}
                onPress={handleResetPassword}
                variant="primary"
              />

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive a code? </Text>
                <TouchableOpacity
                  onPress={handleSendOTP}
                  disabled={resendTimer > 0 || loading}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      (resendTimer > 0 || loading) && styles.resendLinkDisabled,
                    ]}
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Send OTP Button */}
          {!otpSent && (
            <AppButton
              title={loading ? 'Sending code...' : 'Send Verification Code'}
              onPress={handleSendOTP}
              variant="primary"
            />
          )}

          {/* Back to Login */}
          <View style={styles.backContainer}>
            <TouchableOpacity onPress={() => onGoToLogin?.()}>
              <Text style={styles.backLink}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLink: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  matchIndicator: {
    borderRadius: 6,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  matchIndicatorSuccess: {
    backgroundColor: '#D1FAE5',
  },
  matchIndicatorError: {
    backgroundColor: '#FFE5E5',
  },
  matchIndicatorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  matchIndicatorTextSuccess: {
    color: '#059669',
  },
  matchIndicatorTextError: {
    color: COLORS.error,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: COLORS.textLight,
    opacity: 0.5,
  },
  backContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  backLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
});

export default ForgotPasswordPage;
