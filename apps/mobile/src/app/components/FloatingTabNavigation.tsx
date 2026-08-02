import { usePathname, useRouter } from 'expo-router';
import {
  GlassTabBar,
  GlassTabButton,
  TabBarMinimizeProvider,
  type GlassTabItem,
} from 'expo-glass-tabs';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadDot } from '../../hooks/messaging/useUnreadDot';
import { useGetCandidateProfile } from '../../hooks/useGetCandidateProfile';
import { useGetEmployerProfile } from '../../hooks/useGetEmployerProfile';
import { useSidebarVisibility } from '../../contexts/SidebarContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import type { UserRole } from '../constants/role';

type NavigationItem = GlassTabItem & { href: string };

function makeIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ tint, size }: { tint: string; size: number }) => (
    <View style={{ height: size, justifyContent: 'center' }}>
      <Ionicons name={name} size={size} color={tint} />
    </View>
  );
}

function makeIconWithBadge(
  name: keyof typeof Ionicons.glyphMap,
  showBadge: boolean
) {
  return ({ tint, size }: { tint: string; size: number }) => (
    <View style={{ height: size, width: size, justifyContent: 'center' }}>
      <Ionicons name={name} size={size} color={tint} />
      {showBadge && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: -1,
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: COLORS.error,
          }}
        />
      )}
    </View>
  );
}

const CANDIDATE_TABS: NavigationItem[] = [
  {
    name: 'candidate-dashboard',
    href: '/pages/candidate/dashboard',
    label: 'Dashboard',
    renderIcon: makeIcon('home'),
  },
  {
    name: 'candidate-find-jobs',
    href: '/pages/find-jobs',
    label: 'Find Jobs',
    renderIcon: makeIcon('search'),
  },
  {
    name: 'candidate-messages',
    href: '/pages/candidate/messages',
    label: 'Messages',
    renderIcon: makeIcon('chatbubble-ellipses'),
  },
  {
    name: 'candidate-profile',
    href: '/pages/candidate/public-profile',
    label: 'Profile',
    renderIcon: makeIcon('person-circle'),
  },
];

const EMPLOYER_TABS: NavigationItem[] = [
  {
    name: 'employer-dashboard',
    href: '/pages/employer/dashboard',
    label: 'Dashboard',
    renderIcon: makeIcon('home'),
  },
  {
    name: 'employer-jobs',
    href: '/pages/employer/jobs',
    label: 'Jobs',
    renderIcon: makeIcon('briefcase'),
  },
  {
    name: 'employer-messages',
    href: '/pages/employer/messages',
    label: 'Messages',
    renderIcon: makeIcon('chatbubble-ellipses'),
  },
  {
    name: 'employer-applications',
    href: '/pages/employer/all-applications',
    label: 'Applications',
    renderIcon: makeIcon('folder'),
  },
];

function isActiveTab(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const DETAIL_THREAD_PATTERNS = [
  // Detail screens (have back navigation)
  /^\/pages\/find-jobs\/[^/]+$/, // candidate job detail
  /^\/pages\/employer\/jobs\/[^/]+$/, // employer job detail
  /^\/pages\/candidate\/messages\/[^/]+$/, // candidate message thread
  /^\/pages\/employer\/messages\/[^/]+$/, // employer message thread
  // Candidate sub-screens (not main tabs)
  /^\/pages\/candidate\/notifications/,
  /^\/pages\/candidate\/settings/,
  /^\/pages\/candidate\/pre-shortlist/,
  // Employer sub-screens (not main tabs)
  /^\/pages\/employer\/all-applications\/[^/]+$/, // application detail only
  /^\/pages\/employer\/new-job/,
  /^\/pages\/employer\/new-company/,
  /^\/pages\/employer\/edit-job/,
  /^\/pages\/employer\/edit-company/,
  /^\/pages\/employer\/settings/,
];

function isDetailOrThread(pathname: string) {
  return DETAIL_THREAD_PATTERNS.some((re) => re.test(pathname));
}

const EXPANDED_TAB_BAR_HEIGHT = 58;
const BLUR_BLEED = 44;
const MIN_BOTTOM_OFFSET = 12;
const CONTENT_GAP = 8;

// Keep scroll content clear of expo-glass-tabs' fixed pill and blur footprint.
export function getFloatingTabContentInset(bottomInset: number): number {
  const bottomOffset = Math.max(bottomInset - 16, MIN_BOTTOM_OFFSET);
  const blurBleed = Platform.OS === 'android' ? 0 : BLUR_BLEED;
  return bottomOffset + EXPANDED_TAB_BAR_HEIGHT + blurBleed + CONTENT_GAP;
}

export function isFloatingTabRoute(
  pathname: string,
  role: UserRole | null
): boolean {
  if (isDetailOrThread(pathname)) return false;

  if (role === 'candidate') {
    return (
      pathname.startsWith('/pages/candidate') ||
      pathname.startsWith('/pages/find-jobs')
    );
  }

  return role === 'employer' && pathname.startsWith('/pages/employer');
}

function AndroidFloatingTabBar({
  tabs,
  activeIndex,
  onSelect,
}: {
  tabs: NavigationItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const bottomOffset = Math.max(bottomInset - 16, MIN_BOTTOM_OFFSET);

  return (
    <View pointerEvents="box-none" style={styles.androidContainer}>
      <View
        style={[styles.androidBar, { marginBottom: bottomOffset }]}
        accessibilityRole="tablist"
      >
        {tabs.map((item, index) => {
          const isFocused = index === activeIndex;
          const tint = isFocused ? COLORS.primary2 : COLORS.slate400;

          return (
            <Pressable
              key={item.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              onPress={() => onSelect(index)}
              style={[styles.androidTab, isFocused && styles.androidTabActive]}
            >
              {item.renderIcon?.({ tint, size: 21 })}
              <Text style={[styles.androidLabel, { color: tint }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  androidContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidBar: {
    height: EXPANDED_TAB_BAR_HEIGHT,
    marginHorizontal: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: EXPANDED_TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surfaceFallback,
    elevation: 8,
  },
  androidTab: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    paddingTop: 4,
  },
  androidTabActive: {
    backgroundColor: COLORS.navHighlight,
  },
  androidLabel: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '600',
  },
});

export default function FloatingTabNavigation() {
  const { role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen: isSidebarOpen } = useSidebarVisibility();

  // Unread badge for Messages tab
  const { data: candidateProfile } = useGetCandidateProfile();
  const { data: employerProfile } = useGetEmployerProfile();
  const userId =
    role === 'candidate' ? candidateProfile?.id : employerProfile?.id;
  const hasUnread = useUnreadDot(userId);

  const items = role === 'employer' ? EMPLOYER_TABS : CANDIDATE_TABS;

  const isVisible = !isSidebarOpen && isFloatingTabRoute(pathname, role);

  const tabs = useMemo(() => {
    return items.map((item) => ({
      ...item,
      renderIcon:
        item.name === 'candidate-messages' || item.name === 'employer-messages'
          ? makeIconWithBadge('chatbubble-ellipses', hasUnread)
          : item.renderIcon,
    }));
  }, [items, hasUnread]);

  const activeIndex = useMemo(() => {
    const index = tabs.findIndex((item) => isActiveTab(pathname, item.href));
    return index < 0 ? 0 : index;
  }, [tabs, pathname]);

  if (!isVisible) return null;

  const handleTabPress = (index: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const item = tabs[index];
    if (item) router.navigate(item.href as never);
  };

  if (Platform.OS === 'android') {
    return (
      <AndroidFloatingTabBar
        tabs={tabs}
        activeIndex={activeIndex}
        onSelect={handleTabPress}
      />
    );
  }

  return (
    <TabBarMinimizeProvider>
      <GlassTabBar
        onIndexSelected={handleTabPress}
        theme={{
          activeTint: COLORS.primary2,
          inactiveTint: COLORS.slate400,
          highlight: COLORS.navHighlight,
          glassTint: COLORS.glassSurface,
          solidFallback: COLORS.surfaceFallback,
        }}
      >
        {tabs.map((item, index) => (
          <GlassTabButton
            key={item.name}
            item={item}
            index={index}
            isFocused={index === activeIndex}
            onPress={() => handleTabPress(index)}
          />
        ))}
      </GlassTabBar>
    </TabBarMinimizeProvider>
  );
}
