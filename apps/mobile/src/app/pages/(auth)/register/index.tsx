'use client';

import { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { TextInput } from '../../../components/shared/TextInput';
import { Button } from '../../../../components/ui/button';
import { Text } from '../../../../components/ui/text';
import {
  GoogleAuthButton,
  AuthDivider,
} from '../../../components/shared/GoogleAuthButton';
import { useSignup } from '../../../../hooks/useAuth';
import { getSession } from '../../../../lib/auth';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { authClient } from '../../../../lib/auth-client';
import { COLORS } from '../../../constants/theme';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';

type UserType = 'job-seeker' | 'employer';

type FieldName =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'confirmPassword';

type FieldErrors = Partial<Record<FieldName, string>>;
type TouchedFields = Record<FieldName, boolean>;

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  {
    label: 'One special character',
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateField = (
    field: FieldName,
    value: string
  ): string | undefined => {
    switch (field) {
      case 'firstName':
        return value.trim() ? undefined : 'Please enter your first name';
      case 'lastName':
        return value.trim() ? undefined : 'Please enter your last name';
      case 'email':
        if (!value.trim()) return 'Please enter your email address';
        return EMAIL_REGEX.test(value.trim())
          ? undefined
          : 'Please enter a valid email address';
      case 'password':
        if (!value) return 'Please enter a password';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!PASSWORD_REGEX.test(value))
          return 'Password must include upper, lower, number, and special character';
        return undefined;
      case 'confirmPassword':
        return value === password ? undefined : 'Passwords do not match';
    }
  };

  const handleBlur = (field: FieldName, value: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  // ponytail: AuthTextInputProps has no onBlur; spread a helper-built prop
  // instead of touching the shared TextInput interface (task scope = this file).
  const blurProps = (field: FieldName, value: string) => ({
    onBlur: handleBlur(field, value),
  });

  const handleChange =
    (field: FieldName, setter: (text: string) => void) => (text: string) => {
      setter(text);
      if (touched[field]) {
        setErrors((prev) => ({ ...prev, [field]: validateField(field, text) }));
      }
    };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrors((prev) => ({
      ...prev,
      password: touched.password
        ? validateField('password', text)
        : prev.password,
      confirmPassword: touched.confirmPassword
        ? confirmPassword === text
          ? undefined
          : 'Passwords do not match'
        : prev.confirmPassword,
    }));
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          text === password ? undefined : 'Passwords do not match',
      }));
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });

      if (error) {
        throw error;
      }

      const session = await getSession();
      const role = session?.user?.role;

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
        text1: 'Google Sign-Up Failed',
        text2:
          error instanceof Error
            ? error.message
            : 'Unable to complete Google sign-up',
      });
    }
  };

  const handleSignup = async () => {
    const nextErrors: FieldErrors = {
      firstName: validateField('firstName', firstName),
      lastName: validateField('lastName', lastName),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };
    setErrors(nextErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    try {
      const roleMap: Record<UserType, 'candidate' | 'employer'> = {
        'job-seeker': 'candidate',
        employer: 'employer',
      };

      await signup({
        name: `${firstName} ${lastName}`,
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
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during signup';
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: errorMessage,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareView className="flex-1">
        <ScrollView
          className="flex-grow"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View className="px-6 py-8">
            <Text variant="h1" className="text-left mb-2">
              Create Account
            </Text>
            <Text variant="muted" className="text-base">
              Join JoblyAI to get more opportunities and find your next career
              move.
            </Text>
          </View>

          {/* Google Signup */}
          <View className="px-6 text-indigo-700">
            <GoogleAuthButton
              label="Sign Up with Google"
              onPress={handleGoogleSignup}
            />
          </View>

          <View className="px-6">
            <AuthDivider text="Or sign up with email" />
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-destructive/10 rounded-lg p-4 mb-6 border-l-4 border-destructive mx-6">
              <Text className="text-destructive text-sm font-medium">
                {error.message}
              </Text>
            </View>
          )}

          {/* Form */}
          <View className="px-6">
            {/* Name Fields */}
            <View className="flex-row gap-4 mb-2">
              <View className="flex-1">
                <TextInput
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChangeText={handleChange('firstName', setFirstName)}
                  {...blurProps('firstName', firstName)}
                  editable={!loading}
                  error={errors.firstName}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={handleChange('lastName', setLastName)}
                  {...blurProps('lastName', lastName)}
                  editable={!loading}
                  error={errors.lastName}
                />
              </View>
            </View>

            {/* Email */}
            <TextInput
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={handleChange('email', setEmail)}
              {...blurProps('email', email)}
              keyboardType="email-address"
              editable={!loading}
              error={errors.email}
            />

            <View className="h-2" />

            {/* Password */}
            <TextInput
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={handlePasswordChange}
              {...blurProps('password', password)}
              secureTextEntry={!showPassword}
              editable={!loading}
              error={errors.password}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={COLORS.slate500} />
                  ) : (
                    <Eye size={20} color={COLORS.slate500} />
                  )}
                </TouchableOpacity>
              }
            />

            <View className="h-2" />

            {/* Password Checklist */}
            <View className="mb-2 gap-1">
              {PASSWORD_RULES.map((rule) => {
                const satisfied = rule.test(password);
                return (
                  <View
                    key={rule.label}
                    className="flex-row items-center gap-2"
                  >
                    <Text
                      className={`text-xs font-bold ${
                        satisfied ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      {satisfied ? '✓' : '○'}
                    </Text>
                    <Text
                      className={`text-xs ${
                        satisfied ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      {rule.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Confirm Password */}
            <TextInput
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              {...blurProps('confirmPassword', confirmPassword)}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
              error={errors.confirmPassword}
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

            {/* User Type Selection */}
            <View className="my-8 gap-4">
              <Text className="text-md font-semibold text-foreground">
                I am a:
              </Text>
              <TouchableOpacity
                className={`flex-row items-center p-4 border rounded-lg ${
                  userType === 'job-seeker'
                    ? 'border-indigo-700'
                    : 'border-input bg-background'
                }`}
                onPress={() => setUserType('job-seeker')}
                activeOpacity={0.7}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${
                    userType === 'job-seeker'
                      ? 'border-indigo-700'
                      : 'border-input'
                  }`}
                >
                  {userType === 'job-seeker' && (
                    <View className="w-2.5 h-2.5 rounded-full bg-indigo-700" />
                  )}
                </View>
                <View>
                  <Text className="text-lg font-bold text-foreground">
                    Job Seeker
                  </Text>
                  <Text variant="muted" className="text-xs">
                    Looking for my next career move or expand my network
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center p-4 border rounded-lg ${
                  userType === 'employer'
                    ? 'border-indigo-700'
                    : 'border-input bg-background'
                }`}
                onPress={() => setUserType('employer')}
                activeOpacity={0.7}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${
                    userType === 'employer'
                      ? 'border-indigo-700  '
                      : 'border-input'
                  }`}
                >
                  {userType === 'employer' && (
                    <View className="w-2.5 h-2.5 rounded-full bg-indigo-700 " />
                  )}
                </View>
                <View>
                  <Text className="text-lg font-bold text-foreground">
                    Employer
                  </Text>
                  <Text variant="muted" className="text-xs">
                    Hiring talents, sourcing candidates, or posting jobs
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <Button
              className="bg-indigo-700 text-white font-extrabold"
              size="lg"
              onPress={handleSignup}
              disabled={loading}
            >
              <Text>{loading ? 'Creating account...' : 'Create Account'}</Text>
            </Button>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-lg text-muted-foreground">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/pages/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text className="text-lg font-bold text-indigo-700">Login</Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text
              variant="muted"
              className="text-xs mt-6 text-center leading-relaxed"
            >
              By creating an account, you agree to our{' '}
              <Text className="font-bold text-indigo-700">
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text className="font-bold text-indigo-700">Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAwareView>
    </SafeAreaView>
  );
};

export default RegisterPage;
