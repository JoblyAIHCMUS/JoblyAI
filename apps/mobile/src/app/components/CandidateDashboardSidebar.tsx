import { useEffect, useRef, useState } from 'react';
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
import {
  Building2,
  ChevronRight,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { getGreetingName, useUser } from '@/hooks/useUser';
import { useGetCandidateProfile } from '@/hooks/useGetCandidateProfile';
import { useLogout } from '@/hooks/useAuth';
import { useUnreadDot } from '@/hooks/messaging/useUnreadDot';
import { useSidebarVisibility } from '@/contexts/SidebarContext';
import { COLORS } from '@/app/constants/theme';

interface CandidateDashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

const CandidateDashboardSidebar = ({
  isOpen,
  onClose,
  currentPath,
}: CandidateDashboardSidebarProps) => {
  const { width } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(isOpen);
  const translateX = useSharedValue(-width || -500);
  const { data: user } = useUser();
  const { data: candidateProfile } = useGetCandidateProfile();
  const { logout, loading: isLoggingOut } = useLogout();
  const hasUnreadMessages = useUnreadDot(candidateProfile?.id);
  const { setOpen } = useSidebarVisibility();
  const activePath = currentPath ?? '';

  const isRouteActive = (path?: string) =>
    Boolean(path && (activePath === path || activePath.startsWith(`${path}/`)));

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
  }, [isOpen, translateX, width, setOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/pages/candidate/dashboard' },
    {
      name: 'Messages',
      icon: MessageSquare,
      path: '/pages/candidate/messages',
      badge: hasUnreadMessages,
    },
    {
      name: 'My Applications',
      icon: FileText,
      path: '/pages/candidate/my-applications',
    },
    { name: 'Find Jobs', icon: Search, path: '/pages/find-jobs' },
    {
      name: 'Browse Companies',
      icon: Building2,
      path: '/pages/browse-companies',
    },
    {
      name: 'My Public Profile',
      icon: User,
      path: '/pages/candidate/public-profile',
    },
  ];

  const secondaryItems = [
    { name: 'Settings', icon: Settings, path: '/pages/candidate/settings' },
    { name: 'Help Center', icon: HelpCircle },
  ];

  const widthPanResponder = useRef(
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
    } catch {
      onClose();
    }
  };

  if (!isVisible) return null;

  const firstName =
    candidateProfile?.firstName ||
    candidateProfile?.name?.split(' ')[0] ||
    getGreetingName(user);
  const fullName =
    candidateProfile?.name?.trim() ||
    [candidateProfile?.firstName, candidateProfile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.name?.trim() ||
    firstName;
  const avatarInitials = fullName.slice(0, 2).toUpperCase();
  const avatarUrl =
    candidateProfile?.avatarUrl?.trim() || user?.avatarUrl?.trim();

  return (
    <Animated.View
      className="absolute inset-0 z-50 bg-white"
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: width,
          zIndex: 9999,
          backgroundColor: COLORS.white,
          elevation: isOpen ? 5 : 0,
        },
        animatedStyle,
      ]}
      pointerEvents={isOpen ? 'auto' : 'none'}
      {...widthPanResponder.panHandlers}
    >
      <View className="flex-1 bg-white">
        <View className="absolute inset-0 overflow-hidden pointer-events-none">
          <View
            className="absolute -bottom-8 -right-5 h-56 w-56 rounded-full border opacity-80 rotate-45"
            style={{ borderColor: COLORS.sidebarDecoration }}
          />
          <View
            className="absolute bottom-10 -right-8 h-44 w-44 rounded-full border opacity-90 rotate-45"
            style={{ borderColor: COLORS.sidebarDecoration }}
          />
        </View>

        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4">
            <View className="flex-row items-center gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.primary2 }}
              >
                <Image
                  source={require('../../../assets/images/AppIcons/appstore.png')}
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                />
              </View>
              <Text
                className="text-3xl font-extrabold"
                style={{ color: COLORS.darkText }}
              >
                JoblyAI
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-11 w-11 items-center justify-center rounded-full border bg-white"
              style={{ borderColor: COLORS.borderSubtle }}
            >
              <X size={24} color={COLORS.darkText} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-4 pt-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.path);

              return (
                <TouchableOpacity
                  key={item.name}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.path) {
                      onClose();
                      router.push(item.path as never);
                    }
                  }}
                  className={`mb-2 flex-row items-center rounded-2xl px-4 py-4 ${
                    active ? 'shadow-sm' : ''
                  }`}
                  style={
                    active
                      ? { backgroundColor: COLORS.surfaceSelected }
                      : undefined
                  }
                >
                  {active && (
                    <View
                      className="absolute left-2 top-2 bottom-2 w-1 rounded-full"
                      style={{ backgroundColor: COLORS.primary2 }}
                    />
                  )}

                  <Icon
                    size={22}
                    color={active ? COLORS.primary2 : COLORS.textLight}
                    strokeWidth={active ? 2.4 : 2}
                  />

                  <Text
                    className="ml-4 text-base font-semibold"
                    style={{
                      color: active ? COLORS.primary2 : COLORS.slate500,
                    }}
                  >
                    {item.name}
                  </Text>

                  {item.path ? (
                    <ChevronRight
                      size={18}
                      color={active ? COLORS.primary2 : COLORS.textSubtle}
                      strokeWidth={2}
                      className="ml-auto"
                    />
                  ) : (
                    <View className="ml-auto" />
                  )}

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
              className="my-4 h-px"
              style={{ backgroundColor: COLORS.borderMuted }}
            />

            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.path);

              return (
                <TouchableOpacity
                  key={item.name}
                  activeOpacity={0.8}
                  className="mb-1 flex-row items-center rounded-2xl px-4 py-3"
                  style={
                    active
                      ? { backgroundColor: COLORS.surfaceSelected }
                      : undefined
                  }
                  onPress={() => {
                    if (item.path) {
                      onClose();
                      router.push(item.path as never);
                      return;
                    }

                    onClose();
                  }}
                >
                  <Icon
                    size={22}
                    color={active ? COLORS.primary2 : COLORS.slate500}
                  />
                  <Text
                    className={`ml-4 text-base ${
                      active ? 'font-semibold' : 'font-medium'
                    }`}
                    style={{
                      color: active ? COLORS.primary2 : COLORS.slate500,
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              className="mt-2 flex-row items-center px-4 py-3"
              activeOpacity={0.8}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={22} color={COLORS.error} strokeWidth={2.4} />
              <Text
                className="ml-4 text-base font-bold"
                style={{ color: COLORS.error }}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Text>
            </TouchableOpacity>

            <View className="mt-auto pb-4 pt-8">
              <View className="flex-row items-center px-4 mb-4">
                <View
                  className="h-12 w-12 items-center justify-center overflow-hidden rounded-full"
                  style={{ backgroundColor: COLORS.borderUnchecked }}
                >
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      className="text-base font-bold"
                      style={{ color: COLORS.darkText }}
                    >
                      {avatarInitials}
                    </Text>
                  )}
                </View>

                <View className="ml-4">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: COLORS.darkText }}
                  >
                    {fullName}
                  </Text>
                  <Text className="text-sm" style={{ color: COLORS.slate500 }}>
                    {user?.email || ''}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Animated.View>
  );
};

export default CandidateDashboardSidebar;
