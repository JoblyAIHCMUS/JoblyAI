import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import Logo from '../../../assets/images/jobly-logo.svg';
import { COLORS, SPACING } from '../../constants/theme';
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
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6L18 18"
                stroke={COLORS.text}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
          <View style={styles.brandContainer}>
            <View style={styles.logoContainer}>
              <Logo width={34} height={34} />
            </View>
            <Text style={styles.brandText}>JoblyAI</Text>
          </View>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              onClose();
              router.push('/pages/employer/dashboard');
            }}
          >
            <Text style={styles.navText}>Browse Jobs</Text>
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

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Browse Companies</Text>
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

          <View style={styles.divider} />

          <View style={styles.footer}>
            <AppButton
              title="Sign Up"
              onPress={
                onSignUpPress ?? (() => router.push('/pages/(auth)/register'))
              }
            />
            <View style={{ height: SPACING.md }} />
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.white,
    zIndex: 1000,
    // Add shadow for better visual separation during slide
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E6E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
  },
  brandText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#121419',
    letterSpacing: -0.5,
  },
  content: {
    padding: SPACING.lg,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
  },
  navText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: SPACING.lg,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: SPACING.xl,
  },
});

export default Sidebar;
