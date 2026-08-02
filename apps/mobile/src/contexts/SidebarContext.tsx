import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface SidebarVisibilityValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarVisibilityContext = createContext<SidebarVisibilityValue>({
  isOpen: false,
  // ponytail: no-op default — provider always wraps consumers
  setOpen: () => undefined,
});

export function SidebarVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);
  return (
    <SidebarVisibilityContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </SidebarVisibilityContext.Provider>
  );
}

export function useSidebarVisibility() {
  return useContext(SidebarVisibilityContext);
}
