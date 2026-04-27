import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH; // Sidebar takes up 100% of the screen

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Track visibility to unmount component when closed, preventing blocked touches
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5, // Max backdrop opacity
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false); // Hide completely after animation finishes
      });
    }
  }, [isOpen, slideAnim, fadeAnim]);

  const NavItem = ({ label }: { label: string }) => (
    <TouchableOpacity style={styles.navItem} onPress={onClose}>
      <Text style={styles.navLabel}>{label}</Text>
      <ArrowRight size={20} color="#4F46E5" />
    </TouchableOpacity>
  );

  // Do not render anything if the sidebar is completely closed
  if (!isVisible) return null;

  return (
    <View style={styles.overlayContainer}>
      {/* Darkened Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sliding Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.navSection}>
              <NavItem label="Browse Jobs" />
              <NavItem label="Browse Companies" />
            </View>

            <View style={styles.divider} />

            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.signUpButton} onPress={onClose}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loginButton} onPress={onClose}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999, // Ensure it sits on top of everything
    elevation: 999, // For Android
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  navSection: {
    gap: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  navLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 32,
  },
  actionSection: {
    gap: 16,
  },
  signUpButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signUpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loginText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Sidebar;