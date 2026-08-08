import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../../../constants/theme';
import { useGetEmployerProfile } from '../../../../../hooks/useGetEmployerProfile';
import { Link, router } from 'expo-router';
import { NotificationBell } from '../../../../../components/header/NotificationBell';
import { useUnreadNotificationCount } from '../../../../../hooks/useNotifications';

interface EmployerDashboardHeaderProps {
  onMenuPress?: () => void;
}

const EmployerDashboardHeader: React.FC<EmployerDashboardHeaderProps> = ({
  onMenuPress,
}) => {
  const { data: profile, isPending, error } = useGetEmployerProfile();
  const company = profile?.company;
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <SafeAreaView
      edges={['top']}
      className="border-b border-app-border-2 bg-white"
    >
      <View className="h-16 flex-row items-center justify-between px-4">
        {/* Menu Icon Left */}
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-white border border-app-border-3 items-center justify-center"
          activeOpacity={0.7}
          onPress={onMenuPress}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 10H20M4 16H14"
              stroke={COLORS.text}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Center Company Info */}
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl items-center justify-center mr-3 overflow-hidden bg-slate-100">
            {company?.logoUrl ? (
              <Image
                source={{ uri: company.logoUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View
                className="w-full h-full items-center justify-center"
                style={{ backgroundColor: `${COLORS.badgeGreenText}20` }}
              >
                <View
                  className="w-6 h-6 rounded-md"
                  style={{ backgroundColor: COLORS.badgeGreenText }}
                />
              </View>
            )}
          </View>
          <View className="flex-col">
            <Text className="text-app-text-3 text-xs">Company</Text>
            <View className="flex-row items-center flex-wrap">
              {error ? (
                <Text className="text-app-red-1 text-sm font-semibold">
                  Error
                </Text>
              ) : (
                <Text
                  className="text-app-slate-1 text-base font-semibold"
                  numberOfLines={1}
                >
                  {isPending ? 'Loading...' : company?.name || 'Not Affiliated'}
                </Text>
              )}
              {!company && !isPending && !error && (
                <Link href="/pages/employer/new-company" asChild>
                  <TouchableOpacity className="ml-2">
                    <Text className="text-app-primary-1 text-xs font-semibold underline">
                      Register
                    </Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
          </View>
        </View>

        {/* Notification Bell Right */}
        <NotificationBell
          count={unreadCount}
          onPress={() => router.push('/pages/employer/notifications')}
        />
      </View>
    </SafeAreaView>
  );
};

export default EmployerDashboardHeader;
