import React, { useEffect, useRef, useState } from 'react';
import {
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
import Avatar from '../../../../../components/Avatar';
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
import { useSidebarVisibility } from '@/contexts/SidebarContext';
import { COLORS } from '@/app/constants/theme';

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
  const { setOpen } = useSidebarVisibility();
  const company = employerProfile?.company;
  const isUnaffiliated = !company && !isPending && !error;

  // Keep width ref updated for the PanResponder closure
  const widthRef = useRef(width);
  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  useEffect(() => {
    setOpen(isOpen);
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
  }, [isOpen, width, translateX, setOpen]);

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
      className="absolute inset-0 z-50 shadow-2xl elevation-5"
      style={[{ backgroundColor: COLORS.surfaceNavigation }, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 items-center justify-center rounded-full"
              style={{ backgroundColor: COLORS.primary2 }}
            >
              <View className="w-4 h-4 rounded-full bg-white" />
            </View>
            <Text
              className="text-2xl font-extrabold"
              style={{ color: COLORS.darkText }}
            >
              JoblyAI
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={28} color={COLORS.darkText} strokeWidth={2.5} />
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
                className="relative flex-row items-center rounded-xl px-4 py-4 mb-2 overflow-hidden"
                style={
                  isActive
                    ? { backgroundColor: COLORS.surfaceSelected }
                    : undefined
                }
                activeOpacity={0.8}
              >
                {isActive && (
                  <View
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-md"
                    style={{ backgroundColor: COLORS.primary2 }}
                  />
                )}
                <Icon
                  size={24}
                  color={isActive ? COLORS.primary2 : COLORS.slate400}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text
                  className="ml-4 text-[17px] font-semibold"
                  style={{
                    color: isActive ? COLORS.primary2 : COLORS.slate500,
                  }}
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

          <View
            className="h-px my-4 mx-2"
            style={{ backgroundColor: COLORS.borderMuted }}
          />

          <TouchableOpacity
            className="flex-row items-center rounded-xl px-4 py-3 mb-1"
            style={
              isRouteActive(settingsPath)
                ? { backgroundColor: COLORS.surfaceSelected }
                : undefined
            }
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              router.push(settingsPath as never);
            }}
          >
            <Settings
              size={24}
              color={
                isRouteActive(settingsPath) ? COLORS.primary2 : COLORS.slate500
              }
            />
            <Text
              className={`ml-4 text-[17px] ${
                isRouteActive(settingsPath) ? 'font-semibold' : 'font-medium'
              }`}
              style={{
                color: isRouteActive(settingsPath)
                  ? COLORS.primary2
                  : COLORS.slate500,
              }}
            >
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-3 mb-1"
            activeOpacity={0.8}
          >
            <HelpCircle size={24} color={COLORS.slate500} />
            <Text
              className="ml-4 text-[17px] font-medium"
              style={{ color: COLORS.slate500 }}
            >
              Help Center
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-3 mb-8 mt-2"
            activeOpacity={0.8}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={24} color={COLORS.error} strokeWidth={2.5} />
            <Text
              className="ml-4 text-[17px] font-bold"
              style={{ color: COLORS.error }}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>

          <View className="mt-auto pb-4">
            <View className="flex-row items-center px-4 mb-4">
              <Avatar
                url={employerProfile?.avatarUrl ?? null}
                name={employerProfile?.fullName || 'User'}
                size={56}
              />
              <View className="ml-4">
                <Text
                  className="text-[19px] font-bold"
                  style={{ color: COLORS.darkText }}
                >
                  {employerProfile?.fullName || 'Loading...'}
                </Text>
                <Text
                  className="text-[15px]"
                  style={{ color: COLORS.slate500 }}
                >
                  {employerProfile?.email || ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 pb-8 pt-4">
          <Link href="/pages/employer/new-job" asChild>
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-xl py-4"
              style={{
                backgroundColor: isUnaffiliated
                  ? COLORS.borderMuted
                  : COLORS.primary2,
              }}
              activeOpacity={isUnaffiliated ? 1 : 0.9}
              disabled={isUnaffiliated}
            >
              <Plus
                size={22}
                color={isUnaffiliated ? COLORS.textPlaceholder : COLORS.white}
                strokeWidth={2.5}
              />
              <Text
                className="ml-2 text-[18px] font-bold"
                style={{
                  color: isUnaffiliated ? COLORS.slate500 : COLORS.white,
                }}
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
