import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Logo from '../../../../assets/images/jobly-logo.svg';
import { COLORS } from '../../constants/theme';
import { AppButton } from '../shared/AppButton';
import { useRouter } from 'expo-router';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginPress?: () => void;
  onSignUpPress?: () => void;
}

const Sidebar = ({
  isOpen,
  onClose,
  onLoginPress,
  onSignUpPress,
}: SidebarProps) => {
  const { width } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(isOpen);
  const translateX = useSharedValue(-width);
  const router = useRouter();

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger if swiping left and sidebar is active
        return Math.abs(gestureState.dx) > 10 && gestureState.dx < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Follow the finger but don't allow sliding right past 0
        if (gestureState.dx < 0) {
          translateX.value = gestureState.dx;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentWidth = widthRef.current;

        // If swiped more than 1/3 way or high velocity swipe
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
          // Snap back to fully open without bouncing
          translateX.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.quad),
          });
        }
      },
    })
  ).current;

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1000,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
        animatedStyle,
      ]}
      className="bg-app-white-1"
      {...panResponder.panHandlers}
    >
      <SafeAreaView className="flex-1">
        <View className="h-16 flex-row items-center px-4 border-b border-black/5">
          <TouchableOpacity
            onPress={onClose}
            className="w-11 h-11 rounded-full bg-app-white-1 border border-app-border-3 items-center justify-center mr-4"
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6L18 18"
                stroke={COLORS.text}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2.5">
            <View className="w-[34px] h-[34px] rounded-full overflow-hidden">
              <Logo width={34} height={34} />
            </View>
            <Text className="text-2xl font-black text-app-brand-text">
              JoblyAI
            </Text>
          </View>
        </View>

        <View className="p-6 flex-1">
          <TouchableOpacity
            className="flex-row items-center justify-between py-6"
            onPress={() => {
              onClose();
              router.push('/pages/find-jobs');
            }}
          >
            <Text className="text-lg font-bold text-app-primary-1">
              Browse Jobs
            </Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18L15 12L9 6"
                stroke={COLORS.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-6"
            onPress={() => {
              onClose();
              router.push('/pages/browse-companies');
            }}
          >
            <Text className="text-lg font-bold text-app-primary-1">
              Browse Companies
            </Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18L15 12L9 6"
                stroke={COLORS.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View className="h-px bg-black/5 my-6" />

          <View className="mt-auto pb-8">
            <AppButton
              title="Sign Up"
              onPress={
                onSignUpPress ?? (() => router.push('/pages/(auth)/register'))
              }
            />
            <View className="h-4" />
            <AppButton
              title="Login"
              variant="outline"
              onPress={
                onLoginPress ?? (() => router.push('/pages/(auth)/login'))
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export default Sidebar;
