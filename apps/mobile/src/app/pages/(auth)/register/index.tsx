'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING } from '../../../constants/theme';
import { TextInput } from '../../../components/shared/TextInput';
import { AppButton } from '../../../components/shared/AppButton';
import {
  GoogleAuthButton,
  AuthDivider,
} from '../../../components/shared/GoogleAuthButton';
import { useSignup } from '../../../../hooks/useAuth';
import { router } from 'expo-router';

type UserType = 'job-seeker' | 'employer';

const RegisterPage = () => {
  const { signup, loading, error } = useSignup();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('job-seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your first name',
      });
      return;
    }

    if (!lastName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your last name',
      });
      return;
    }

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
        text2: 'Please enter a password',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 8 characters',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    try {
      const roleMap: Record<UserType, 'candidate' | 'employer'> = {
        'job-seeker': 'candidate',
        employer: 'employer',
      };

      await signup({
        firstName,
        lastName,
        email,
        password,
        role: roleMap[userType],
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully! Redirecting...',
      });
      router.push('/pages/(auth)/login');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2:
          error?.message ||
          'An error occurred during signup. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Get more opportunities</Text>
        </View>

        {/* Google Signup */}
        <GoogleAuthButton label="Sign Up with Google" />

        <AuthDivider text="Or sign up with email" />

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Name Fields */}
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
              />
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Re-enter password"
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

          {/* User Type Selection */}
          <View style={styles.userTypeSection}>
            <TouchableOpacity
              style={styles.radioButtonContainer}
              onPress={() => setUserType('job-seeker')}
            >
              <View
                style={[
                  styles.radioButton,
                  userType === 'job-seeker' ? styles.radioButtonSelected : {},
                ]}
              >
                {userType === 'job-seeker' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View>
                <Text style={styles.radioLabel}>Job Seeker</Text>
                <Text style={styles.radioDescription}>Looking for a job</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButtonContainer}
              onPress={() => setUserType('employer')}
            >
              <View
                style={[
                  styles.radioButton,
                  userType === 'employer' ? styles.radioButtonSelected : {},
                ]}
              >
                {userType === 'employer' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View>
                <Text style={styles.radioLabel}>Employer</Text>
                <Text style={styles.radioDescription}>
                  Hiring, sourcing candidates, or posting jobs
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <AppButton
            title={loading ? 'Creating account...' : 'Continue'}
            onPress={handleSignup}
            variant="primary"
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/pages/(auth)/login')}
            >
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By clicking 'Continue', you acknowledge that you have read and
            accept the Terms of Service and Privacy Policy.
          </Text>
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
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Inter',
    marginBottom: SPACING.sm,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Inter',
    marginBottom: SPACING.xs,
  },
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  nameField: {
    flex: 1,
    marginBottom: SPACING.md,
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
  userTypeSection: {
    marginVertical: SPACING.lg,
    gap: SPACING.md,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center', // use center instead of flex-start for cleaner look
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D5DD',
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10, // slightly bigger inner dot
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  radioDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.md,
    lineHeight: 18,
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

export default RegisterPage;
