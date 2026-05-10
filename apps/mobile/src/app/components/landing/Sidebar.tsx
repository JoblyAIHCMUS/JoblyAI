import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  PanResponder,
  useWindowDimensions
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Logo from '../../../assets/images/jobly-logo.svg';
import { COLORS, SPACING } from '../../constants/theme';
import { AppButton } from '../shared/AppButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { width } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(isOpen);
  const translateX = useSharedValue(isOpen ? 0 : -width);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      translateX.value = withSpring(-width, {
        damping: 20,
        stiffness: 90,
      }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
    }
  }, [isOpen, width, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger if swiping left and already open (or close to open)
        return Math.abs(gestureState.dx) > 20 && gestureState.dx < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.value = gestureState.dx;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -width / 3 || gestureState.vx < -0.5) {
          translateX.value = withTiming(-width, {}, (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          });
        } else {
          translateX.value = withSpring(0);
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
              <Path d="M18 6L6 18M6 6L18 18" stroke={COLORS.text} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.brandContainer}>
            <Logo width={30} height={30} />
            <Text style={styles.brandText}>JoblyAI</Text>
          </View>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Browse Jobs</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18L15 12L9 6" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Browse Companies</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18L15 12L9 6" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <AppButton title="Sign Up" onPress={() => { /* no-op */ }} />
            <View style={{ height: SPACING.md }} />
            <AppButton title="Login" variant="outline" onPress={() => { /* no-op */ }} />
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
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
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
