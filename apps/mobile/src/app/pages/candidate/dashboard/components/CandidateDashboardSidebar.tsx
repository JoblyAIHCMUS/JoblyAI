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

import { getGreetingName, useUser } from '../../../../../hooks/useUser';
import { useGetCandidateProfile } from '../../../../../hooks/useGetCandidateProfile';
import { useLogout } from '../../../../../hooks/useAuth';
import { useUnreadDot } from '../../../../../hooks/messaging/useUnreadDot';

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
  }, [isOpen, translateX, width]);

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
    { name: 'Find Jobs', icon: Search, path: '/pages/candidate/find-jobs' },
    { name: 'Browse Companies', icon: Building2, path: '/' },
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
          backgroundColor: 'white',
          elevation: isOpen ? 5 : 0,
        },
        animatedStyle,
      ]}
      pointerEvents={isOpen ? 'auto' : 'none'}
      {...widthPanResponder.panHandlers}
    >
      <View className="flex-1 bg-white">
        <View className="absolute inset-0 overflow-hidden pointer-events-none">
          <View className="absolute -bottom-8 -right-5 h-56 w-56 rounded-full border border-[#cfd2ff] opacity-80 rotate-45" />
          <View className="absolute bottom-10 -right-8 h-44 w-44 rounded-full border border-[#cfd2ff] opacity-90 rotate-45" />
        </View>

        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5]">
                <View className="h-5 w-5 rounded-full border-2 border-white" />
              </View>
              <Text className="text-3xl font-extrabold text-[#111827]">
                JoblyAI
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-11 w-11 items-center justify-center rounded-full border border-[#e6e8f0] bg-white"
            >
              <X size={24} color="#111827" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-4 pt-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === currentPath;

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
                    active ? 'bg-[#EEEDFC] shadow-sm' : ''
                  }`}
                >
                  {active && (
                    <View className="absolute left-2 top-2 bottom-2 w-1 rounded-full bg-[#4F46E5]" />
                  )}

                  <Icon
                    size={22}
                    color={active ? '#4F46E5' : '#7c8493'}
                    strokeWidth={active ? 2.4 : 2}
                  />

                  <Text
                    className={`ml-4 text-base font-semibold ${
                      active ? 'text-[#4F46E5]' : 'text-[#64748B]'
                    }`}
                  >
                    {item.name}
                  </Text>

                  {item.path ? (
                    <ChevronRight
                      size={18}
                      color={active ? '#4F46E5' : '#c1c7d0'}
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

            <View className="my-4 h-px bg-[#CBD5E1]" />

            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === currentPath;

              return (
                <TouchableOpacity
                  key={item.name}
                  activeOpacity={0.8}
                  className={`mb-1 flex-row items-center rounded-2xl px-4 py-3 ${
                    active ? 'bg-[#EEEDFC]' : ''
                  }`}
                  onPress={() => {
                    if (item.path) {
                      onClose();
                      router.push(item.path as never);
                      return;
                    }

                    onClose();
                  }}
                >
                  <Icon size={22} color={active ? '#4F46E5' : '#64748B'} />
                  <Text
                    className={`ml-4 text-base ${
                      active
                        ? 'font-semibold text-[#4F46E5]'
                        : 'font-medium text-[#64748B]'
                    }`}
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
              <LogOut size={22} color="#EF4444" strokeWidth={2.4} />
              <Text className="ml-4 text-base font-bold text-[#EF4444]">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Text>
            </TouchableOpacity>

            <View className="mt-auto pb-4 pt-8">
              <View className="flex-row items-center px-4 mb-4">
                <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#d1d5db]">
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-base font-bold text-[#111827]">
                      {avatarInitials}
                    </Text>
                  )}
                </View>

                <View className="ml-4">
                  <Text className="text-lg font-bold text-[#111827]">
                    {fullName}
                  </Text>
                  <Text className="text-sm text-[#64748B]">
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
