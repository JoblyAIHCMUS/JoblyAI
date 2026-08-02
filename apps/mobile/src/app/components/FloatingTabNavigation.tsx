import { usePathname, useRouter } from 'expo-router';
import {
  GlassTabBar,
  GlassTabButton,
  TabBarMinimizeProvider,
  type GlassTabItem,
} from 'expo-glass-tabs';
import { useMemo } from 'react';
import { Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadDot } from '../../hooks/messaging/useUnreadDot';
import { useGetCandidateProfile } from '../../hooks/useGetCandidateProfile';
import { useGetEmployerProfile } from '../../hooks/useGetEmployerProfile';
import { useSidebarVisibility } from '../../contexts/SidebarContext';

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
            backgroundColor: '#EF4444',
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

  const isVisible = (() => {
    if (isSidebarOpen) return false;
    if (isDetailOrThread(pathname)) return false;
    if (role === 'candidate') {
      return (
        pathname.startsWith('/pages/candidate') ||
        pathname.startsWith('/pages/find-jobs')
      );
    }
    if (role === 'employer') {
      return pathname.startsWith('/pages/employer');
    }
    return false;
  })();

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

  return (
    <TabBarMinimizeProvider>
      <GlassTabBar
        onIndexSelected={handleTabPress}
        theme={{
          activeTint: '#4F46E5',
          inactiveTint: '#94A3B8',
          highlight: 'rgba(79, 70, 229, 0.12)',
          glassTint: 'rgba(255, 255, 255, 0.72)',
          solidFallback: 'rgba(241, 245, 249, 0.96)',
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
