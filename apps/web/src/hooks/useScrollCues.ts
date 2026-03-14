import { useEffect, useRef, useState } from 'react';

type ScrollCues = {
  tabsContainerRef: React.RefObject<HTMLDivElement | null>;
  isCompactScreen: boolean;
  showLeftCue: boolean;
  showRightCue: boolean;
};

export function useScrollCues(compactBreakpoint = 1279): ScrollCues {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const [showLeftCue, setShowLeftCue] = useState(false);
  const [showRightCue, setShowRightCue] = useState(false);

  useEffect(() => {
    const updateScrollCues = () => {
      const tabsElement = tabsContainerRef.current;
      if (!tabsElement) {
        return;
      }

      const compact = window.matchMedia(
        `(max-width: ${compactBreakpoint}px)`
      ).matches;
      setIsCompactScreen(compact);

      if (!compact) {
        setShowLeftCue(false);
        setShowRightCue(false);
        return;
      }

      const canScroll = tabsElement.scrollWidth > tabsElement.clientWidth + 1;
      setShowLeftCue(canScroll && tabsElement.scrollLeft > 4);
      setShowRightCue(
        canScroll &&
          tabsElement.scrollLeft <
            tabsElement.scrollWidth - tabsElement.clientWidth - 4
      );
    };

    updateScrollCues();

    const tabsElement = tabsContainerRef.current;
    tabsElement?.addEventListener('scroll', updateScrollCues, { passive: true });
    window.addEventListener('resize', updateScrollCues);

    return () => {
      tabsElement?.removeEventListener('scroll', updateScrollCues);
      window.removeEventListener('resize', updateScrollCues);
    };
  }, [compactBreakpoint]);

  return { tabsContainerRef, isCompactScreen, showLeftCue, showRightCue };
}
