import { Stack, useRouter } from 'expo-router';
import {
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  ClipboardList,
  LockKeyhole,
  LogOut,
  Menu,
  Sparkles,
  User,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
  type NotificationSettingsKey,
} from '@/api/notifications';
import { COLORS } from '@/app/constants/theme';
import { useLogout } from '@/hooks/useAuth';
import CandidateDashboardSidebar from '@/app/components/CandidateDashboardSidebar';
import EmployerDashboardSidebar from '../employer/dashboard/components/EmployerDashboardSidebar';

type SettingsRole = 'candidate' | 'employer';
type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type PreferenceItem = {
  key: NotificationSettingsKey;
  label: string;
  description: string;
  icon: IconComponent;
};

export type SettingsAccount = {
  name: string;
  email: string;
  avatarUrl?: string;
  caption: string;
};

const ROLE_CONFIG = {
  candidate: {
    title: 'Settings',
    subtitle: 'Manage your account, notifications, and security preferences.',
    currentPath: '/pages/candidate/settings',
    profilePath: '/pages/candidate/public-profile',
    passwordSecurityPath: '/pages/candidate/settings/password-security',
    profileLabel: 'Public profile',
    profileDescription: 'Update your candidate profile and portfolio details',
    profileIcon: User,
  },
  employer: {
    title: 'Settings',
    subtitle: 'Manage company account preferences and hiring alerts.',
    currentPath: '/pages/employer/settings',
    profilePath: '/pages/employer/company-profile',
    passwordSecurityPath: '/pages/employer/settings/password-security',
    profileLabel: 'Company profile',
    profileDescription: 'Edit company information and team presentation',
    profileIcon: Building2,
  },
} as const;

const PREFERENCES: PreferenceItem[] = [
  {
    key: 'applications',
    label: 'Applications',
    description: 'Send push notifications for jobs that you have applied to.',
    icon: ClipboardList,
  },
  {
    key: 'jobs',
    label: 'Jobs',
    description: 'Send push notifications for job openings that suit you.',
    icon: BriefcaseBusiness,
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    description: 'Send push notifications for personalized recommendations.',
    icon: Sparkles,
  },
];

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  applications: true,
  jobs: true,
  recommendations: true,
};

function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'JA';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function SettingRow({
  icon: Icon,
  title,
  description,
  onPress,
}: {
  icon: IconComponent;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center rounded-lg border border-app-border-3 bg-white px-4 py-4"
    >
      <View className="h-11 w-11 items-center justify-center rounded-lg bg-app-background-1">
        <Icon size={20} color={COLORS.primary} strokeWidth={2.2} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-bold text-app-text-4">{title}</Text>
        <Text className="mt-1 text-[12px] leading-4 text-app-text-5">
          {description}
        </Text>
      </View>
      <ChevronRight size={19} color={COLORS.slate400} />
    </TouchableOpacity>
  );
}

function PreferenceToggle({
  item,
  enabled,
  onChange,
  disabled,
  loading,
}: {
  item: PreferenceItem;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const Icon = item.icon;

  return (
    <View className="flex-row items-center rounded-lg border border-app-border-3 bg-white px-4 py-4">
      <View className="h-11 w-11 items-center justify-center rounded-lg bg-app-slate-gray">
        <Icon size={20} color={COLORS.slate500} strokeWidth={2.2} />
      </View>
      <View className="ml-3 flex-1 pr-3">
        <Text className="text-[15px] font-bold text-app-text-4">
          {item.label}
        </Text>
        <Text className="mt-1 text-[12px] leading-4 text-app-text-5">
          {item.description}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Switch
          value={enabled}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{
            false: COLORS.borderMuted,
            true: COLORS.indigoTrack,
          }}
          thumbColor={enabled ? COLORS.primary : COLORS.white}
          ios_backgroundColor={COLORS.borderMuted}
        />
      )}
    </View>
  );
}

function getSettingsErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export default function SettingsScreen({
  role,
  account,
}: {
  role: SettingsRole;
  account: SettingsAccount;
}) {
  const router = useRouter();
  const config = ROLE_CONFIG[role];
  const { logout, loading: isLoggingOut } = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoadingNotificationSettings, setIsLoadingNotificationSettings] =
    useState(true);
  const [savingPreference, setSavingPreference] =
    useState<NotificationSettingsKey | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNotificationSettings() {
      setIsLoadingNotificationSettings(true);

      try {
        const settings = await getNotificationSettings(controller.signal);
        setNotificationSettings(settings);
      } catch (error) {
        if (!controller.signal.aborted) {
          Toast.show({
            type: 'error',
            text1: 'Failed to load notifications',
            text2: getSettingsErrorMessage(
              error,
              'Please try opening settings again.'
            ),
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingNotificationSettings(false);
        }
      }
    }

    void loadNotificationSettings();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setAvatarImageFailed(false);
  }, [account.avatarUrl]);

  const handleNotificationPreferenceChange = async (
    key: NotificationSettingsKey,
    value: boolean
  ) => {
    if (savingPreference) {
      return;
    }

    const previousSettings = notificationSettings;
    const nextSettings = {
      ...notificationSettings,
      [key]: value,
    };

    setNotificationSettings(nextSettings);
    setSavingPreference(key);

    try {
      const savedSettings = await updateNotificationSettings({ [key]: value });
      setNotificationSettings(savedSettings);
      Toast.show({
        type: 'success',
        text1: 'Notification settings updated',
      });
    } catch (error) {
      setNotificationSettings(previousSettings);
      Toast.show({
        type: 'error',
        text1: 'Failed to update notifications',
        text2: getSettingsErrorMessage(error, 'Please try again.'),
      });
    } finally {
      setSavingPreference(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Logout failed',
        text2: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const avatarUri =
    account.avatarUrl && !avatarImageFailed ? account.avatarUrl : null;

  return (
    <SafeAreaView className="flex-1 bg-app-background-2" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="border-b border-app-border-2 bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.75}
            className="h-11 w-11 items-center justify-center rounded-full border border-app-border-3 bg-white"
            onPress={() => setIsSidebarOpen(true)}
          >
            <Menu size={22} color={COLORS.textStrong} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-app-text-4">
            {config.title}
          </Text>
          <View className="h-11 w-11" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5">
          <Text className="text-[28px] font-bold leading-9 text-app-text-4">
            Account settings
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-app-text-5">
            {config.subtitle}
          </Text>
        </View>

        <View className="mb-5 rounded-lg border border-app-border-3 bg-white p-4">
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-app-indigo-soft">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="h-full w-full"
                  resizeMode="cover"
                  onError={() => setAvatarImageFailed(true)}
                />
              ) : (
                <Text className="text-lg font-bold text-app-primary-1">
                  {getInitials(account.name)}
                </Text>
              )}
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[19px] font-bold text-app-text-4"
                numberOfLines={1}
              >
                {account.name}
              </Text>
              <Text className="mt-1 text-sm text-app-text-5" numberOfLines={1}>
                {account.email}
              </Text>
              <Text className="mt-1 text-xs font-semibold text-app-primary-1">
                {account.caption}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-5 gap-3">
          <Text className="text-[13px] font-bold uppercase text-app-text-5">
            Profile
          </Text>
          <SettingRow
            icon={config.profileIcon}
            title={config.profileLabel}
            description={config.profileDescription}
            onPress={() => router.push(config.profilePath as never)}
          />
          <SettingRow
            icon={LockKeyhole}
            title="Password and security"
            description="Review password, sessions, and sign-in protection"
            onPress={() => router.push(config.passwordSecurityPath as never)}
          />
        </View>

        <View className="mb-5 gap-3">
          <Text className="text-[13px] font-bold uppercase text-app-text-5">
            Preferences
          </Text>
          {PREFERENCES.map((item) => (
            <PreferenceToggle
              key={item.key}
              item={item}
              enabled={notificationSettings[item.key]}
              disabled={
                isLoadingNotificationSettings || savingPreference !== null
              }
              loading={
                isLoadingNotificationSettings || savingPreference === item.key
              }
              onChange={(value) =>
                void handleNotificationPreferenceChange(item.key, value)
              }
            />
          ))}
        </View>

        <View className="gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isLoggingOut}
            onPress={handleLogout}
            className="flex-row items-center justify-center rounded-lg border border-red-100 bg-white px-4 py-4"
          >
            <LogOut size={20} color={COLORS.error} strokeWidth={2.4} />
            <Text className="ml-2 text-[16px] font-bold text-app-red-1">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {role === 'candidate' ? (
        <CandidateDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath={config.currentPath}
        />
      ) : (
        <EmployerDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}
