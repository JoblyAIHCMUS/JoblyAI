import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import {
  Building2,
  ClipboardList,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react-native';
import { usePathname, useRouter, Link } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useGetEmployerProfile } from '../../../../../hooks/useGetEmployerProfile';
import { useLogout } from '../../../../../hooks/useAuth';
import { useUnreadDot } from '../../../../../hooks/messaging/useUnreadDot';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmployerDashboardSidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { width } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(isOpen);
  const translateX = useSharedValue(-width);
  const router = useRouter();
  const pathname = usePathname();
  const { data: employerProfile, isPending, error } = useGetEmployerProfile();
  const { logout, loading: isLoggingOut } = useLogout();
  const hasUnreadMessages = useUnreadDot(employerProfile?.id);
  const company = employerProfile?.company;
  const isUnaffiliated = !company && !isPending && !error;
  const avatarUrl = employerProfile?.avatarUrl?.trim();
  const isSvgAvatar =
    !!avatarUrl &&
    (avatarUrl.endsWith('.svg') ||
      avatarUrl.includes('/svg') ||
      avatarUrl.includes('image/svg+xml'));

  // Keep width ref updated for the PanResponder closure
  const widthRef = useRef(width);
  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    } else {
      translateX.value = withTiming(
        -width,
        {
          duration: 250,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(setIsVisible)(false);
          }
        }
      );
    }
  }, [isOpen, width, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const primaryNav = [
    { name: 'Dashboard', icon: Home, path: '/pages/employer/dashboard' },
    {
      name: 'Messages',
      icon: MessageSquare,
      path: '/pages/employer/messages',
      badge: hasUnreadMessages,
    },
    {
      name: 'Company Profile',
      icon: Building2,
      path: '/pages/employer/company-profile',
    },
    {
      name: 'All Applications',
      icon: Users,
      path: '/pages/employer/all-applications',
    },
    {
      name: 'Job Listing',
      icon: ClipboardList,
      path: '/pages/employer/jobs',
    },
  ];
  const settingsPath = '/pages/employer/settings';

  const isRouteActive = (path: string) => {
    if (path === '/pages/employer/dashboard') {
      return pathname === path || pathname === '/';
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && gestureState.dx < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.value = gestureState.dx;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentWidth = widthRef.current;

        if (gestureState.dx < -currentWidth / 3 || gestureState.vx < -0.5) {
          translateX.value = withTiming(
            -currentWidth,
            {
              duration: 200,
              easing: Easing.out(Easing.quad),
            },
            (finished) => {
              if (finished) {
                runOnJS(onClose)();
              }
            }
          );
        } else {
          translateX.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.quad),
          });
        }
      },
    })
  ).current;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';

      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: message,
      });
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      className="absolute inset-0 z-50 bg-[#f8f9fa] shadow-2xl elevation-5"
      style={animatedStyle}
      {...panResponder.panHandlers}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 items-center justify-center rounded-full bg-[#4F46E5]">
              <View className="w-4 h-4 rounded-full bg-white" />
            </View>
            <Text className="text-2xl font-extrabold text-[#111827]">
              JoblyAI
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={28} color="#111827" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-4 pt-4">
          {primaryNav.map((item) => {
            const isActive = isRouteActive(item.path);
            const Icon = item.icon;

            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => {
                  onClose();
                  router.push(item.path as never);
                }}
                className={`relative flex-row items-center rounded-xl px-4 py-4 mb-2 overflow-hidden ${
                  isActive ? 'bg-[#EEEDFC]' : ''
                }`}
                activeOpacity={0.8}
              >
                {isActive && (
                  <View className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-md bg-[#4F46E5]" />
                )}
                <Icon
                  size={24}
                  color={isActive ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text
                  className={`ml-4 text-[17px] font-semibold ${
                    isActive ? 'text-[#4F46E5]' : 'text-[#64748B]'
                  }`}
                >
                  {item.name}
                </Text>

                {item.badge && (
                  <View
                    testID="sidebar-unread-dot"
                    className="ml-auto h-2.5 w-2.5 rounded-full bg-app-primary-1"
                  />
                )}
              </TouchableOpacity>
            );
          })}

          <View className="h-px bg-[#CBD5E1] my-4 mx-2" />

          <TouchableOpacity
            className={`flex-row items-center rounded-xl px-4 py-3 mb-1 ${
              isRouteActive(settingsPath) ? 'bg-[#EEEDFC]' : ''
            }`}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              router.push(settingsPath as never);
            }}
          >
            <Settings
              size={24}
              color={isRouteActive(settingsPath) ? '#4F46E5' : '#64748B'}
            />
            <Text
              className={`ml-4 text-[17px] ${
                isRouteActive(settingsPath)
                  ? 'font-semibold text-[#4F46E5]'
                  : 'font-medium text-[#64748B]'
              }`}
            >
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-3 mb-1"
            activeOpacity={0.8}
          >
            <HelpCircle size={24} color="#64748B" />
            <Text className="ml-4 text-[17px] font-medium text-[#64748B]">
              Help Center
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-3 mb-8 mt-2"
            activeOpacity={0.8}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={24} color="#EF4444" strokeWidth={2.5} />
            <Text className="ml-4 text-[17px] font-bold text-[#EF4444]">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>

          <View className="mt-auto pb-4">
            <View className="flex-row items-center px-4 mb-4">
              <View className="w-14 h-14 overflow-hidden rounded-full bg-[#D1D5DB]">
                {avatarUrl ? (
                  isSvgAvatar ? (
                    <SvgUri uri={avatarUrl} width={56} height={56} />
                  ) : (
                    <Image
                      source={{ uri: avatarUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  )
                ) : null}
              </View>
              <View className="ml-4">
                <Text className="text-[19px] font-bold text-[#111827]">
                  {employerProfile?.fullName || 'Loading...'}
                </Text>
                <Text className="text-[15px] text-[#64748B]">
                  {employerProfile?.email || ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 pb-8 pt-4">
          <Link href="/pages/employer/new-job" asChild>
            <TouchableOpacity
              className={`flex-row items-center justify-center rounded-xl py-4 ${
                isUnaffiliated ? 'bg-slate-300' : 'bg-[#4F46E5]'
              }`}
              activeOpacity={isUnaffiliated ? 1 : 0.9}
              disabled={isUnaffiliated}
            >
              <Plus
                size={22}
                color={isUnaffiliated ? '#9CA3AF' : '#ffffff'}
                strokeWidth={2.5}
              />
              <Text
                className={`ml-2 text-[18px] font-bold ${
                  isUnaffiliated ? 'text-slate-500' : 'text-white'
                }`}
              >
                Post a job
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export default EmployerDashboardSidebar;
