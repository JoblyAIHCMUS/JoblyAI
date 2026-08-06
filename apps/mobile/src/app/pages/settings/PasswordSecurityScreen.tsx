import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useChangePassword } from '../../../hooks/useAuth';
import { COLORS } from '../../constants/theme';
import { KeyboardAwareView } from '@/components/KeyboardAwareView';

type SettingsRole = 'candidate' | 'employer';
type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type PasswordFieldName = 'currentPassword' | 'newPassword' | 'confirmPassword';

const PASSWORD_RULES = [
  {
    label: 'At least 8 characters',
    test: (value: string) => value.length >= 8,
  },
  {
    label: 'One uppercase letter',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: 'One lowercase letter',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: 'One number',
    test: (value: string) => /\d/.test(value),
  },
  {
    label: 'One special character',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

const ROLE_COPY = {
  candidate: {
    subtitle: 'Keep your candidate account protected while applying for jobs.',
  },
  employer: {
    subtitle: 'Protect company hiring data with a strong account password.',
  },
} as const;

function SecurityCard({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row rounded-lg border border-app-border-3 bg-white px-4 py-4">
      <View className="h-11 w-11 items-center justify-center rounded-lg bg-app-background-1">
        <Icon size={20} color={COLORS.primary} strokeWidth={2.2} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-bold text-app-text-4">{title}</Text>
        <Text className="mt-1 text-[12px] leading-4 text-app-text-5">
          {description}
        </Text>
      </View>
    </View>
  );
}

function PasswordInput({
  label,
  value,
  visible,
  onChangeText,
  onToggleVisibility,
}: {
  label: string;
  value: string;
  visible: boolean;
  onChangeText: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <View>
      <Text className="mb-2 text-sm font-bold text-app-text-4">{label}</Text>
      <View className="h-12 flex-row items-center rounded-lg border border-app-border-3 bg-white px-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          placeholder="Enter password"
          placeholderTextColor={COLORS.textPlaceholder}
          className="h-full flex-1 text-[15px] text-app-text-4"
        />
        <TouchableOpacity
          activeOpacity={0.7}
          className="h-10 w-10 items-center justify-center"
          onPress={onToggleVisibility}
        >
          {visible ? (
            <EyeOff size={19} color={COLORS.slate500} />
          ) : (
            <Eye size={19} color={COLORS.slate500} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PasswordSecurityScreen({
  role,
}: {
  role: SettingsRole;
}) {
  const router = useRouter();
  const { changePassword, loading } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signOutOtherDevices, setSignOutOtherDevices] = useState(true);
  const [visibleFields, setVisibleFields] = useState<
    Record<PasswordFieldName, boolean>
  >({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const rules = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        passed: rule.test(newPassword),
      })),
    [newPassword]
  );
  const passwordValid = rules.every((rule) => rule.passed);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && passwordValid && passwordsMatch && !loading;

  const toggleField = (field: PasswordFieldName) => {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Current password required',
        text2: 'Enter your current password to continue.',
      });
      return;
    }

    if (!passwordValid) {
      Toast.show({
        type: 'error',
        text1: 'Password is too weak',
        text2: 'Make sure every password rule is satisfied.',
      });
      return;
    }

    if (!passwordsMatch) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
        text2: 'Confirm your new password before saving.',
      });
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: signOutOtherDevices,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Toast.show({
        type: 'success',
        text1: 'Password updated',
        text2: signOutOtherDevices
          ? 'Other sessions were signed out.'
          : 'Your password was changed successfully.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not update password',
        text2: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-app-background-2"
      edges={['top', 'bottom']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View className="border-b border-app-border-2 bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.75}
            className="h-11 w-11 items-center justify-center rounded-full border border-app-border-3 bg-white"
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={COLORS.textStrong} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-app-text-4">
            Password and security
          </Text>
          <View className="h-11 w-11" />
        </View>
      </View>

      <KeyboardAwareView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View className="mb-5">
          <Text className="text-[28px] font-bold leading-9 text-app-text-4">
            Secure your account
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-app-text-5">
            {ROLE_COPY[role].subtitle}
          </Text>
        </View>

        <View className="mb-5 gap-3">
          <SecurityCard
            icon={ShieldCheck}
            title="Protected sign-in"
            description="Use a unique password and update it if you suspect unusual activity."
          />
          <SecurityCard
            icon={Smartphone}
            title="Active mobile session"
            description="Changing your password keeps this device signed in after the update."
          />
        </View>

        <View className="mb-5 gap-4 rounded-lg border border-app-border-3 bg-white p-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-lg bg-app-background-1">
              <LockKeyhole size={20} color={COLORS.primary} strokeWidth={2.2} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[17px] font-bold text-app-text-4">
                Change password
              </Text>
              <Text className="mt-1 text-[12px] leading-4 text-app-text-5">
                Your new password must meet every requirement below.
              </Text>
            </View>
          </View>

          <PasswordInput
            label="Current password"
            value={currentPassword}
            visible={visibleFields.currentPassword}
            onChangeText={setCurrentPassword}
            onToggleVisibility={() => toggleField('currentPassword')}
          />
          <PasswordInput
            label="New password"
            value={newPassword}
            visible={visibleFields.newPassword}
            onChangeText={setNewPassword}
            onToggleVisibility={() => toggleField('newPassword')}
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            visible={visibleFields.confirmPassword}
            onChangeText={setConfirmPassword}
            onToggleVisibility={() => toggleField('confirmPassword')}
          />

          <View className="gap-2 rounded-lg bg-app-slate-gray p-3">
            {rules.map((rule) => (
              <View key={rule.label} className="flex-row items-center">
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full ${
                    rule.passed ? 'bg-app-green-1' : 'bg-app-slate-3'
                  }`}
                >
                  <Check size={13} color={COLORS.white} strokeWidth={3} />
                </View>
                <Text
                  className={`ml-2 text-[12px] font-semibold ${
                    rule.passed ? 'text-app-text-4' : 'text-app-text-5'
                  }`}
                >
                  {rule.label}
                </Text>
              </View>
            ))}
            <View className="flex-row items-center">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full ${
                  passwordsMatch ? 'bg-app-green-1' : 'bg-app-slate-3'
                }`}
              >
                <Check size={13} color={COLORS.white} strokeWidth={3} />
              </View>
              <Text
                className={`ml-2 text-[12px] font-semibold ${
                  passwordsMatch ? 'text-app-text-4' : 'text-app-text-5'
                }`}
              >
                Passwords match
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-5 flex-row items-center rounded-lg border border-app-border-3 bg-white px-4 py-4">
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-app-slate-gray">
            <KeyRound size={20} color={COLORS.slate500} strokeWidth={2.2} />
          </View>
          <View className="ml-3 flex-1 pr-3">
            <Text className="text-[15px] font-bold text-app-text-4">
              Sign out other devices
            </Text>
            <Text className="mt-1 text-[12px] leading-4 text-app-text-5">
              Revoke other active sessions after your password is changed.
            </Text>
          </View>
          <Switch
            value={signOutOtherDevices}
            onValueChange={setSignOutOtherDevices}
            trackColor={{ false: COLORS.borderMuted, true: COLORS.indigoTrack }}
            thumbColor={signOutOtherDevices ? COLORS.primary : COLORS.white}
            ios_backgroundColor={COLORS.borderMuted}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`flex-row items-center justify-center rounded-lg px-4 py-4 ${
            canSubmit ? 'bg-app-primary-1' : 'bg-app-bg-disabled'
          }`}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text
              className={`text-[16px] font-bold ${
                canSubmit ? 'text-white' : 'text-app-text-placeholder'
              }`}
            >
              Update password
            </Text>
          )}
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAwareView>
    </SafeAreaView>
  );
}
