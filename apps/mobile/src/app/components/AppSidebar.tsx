import { authClient } from '@/lib/auth-client';
import { USER_ROLE } from '@/app/constants/role';

import Sidebar from '@/app/components/landing/Sidebar';
import CandidateDashboardSidebar from '@/app/components/CandidateDashboardSidebar';
// import EmployerDashboardSidebar from '@/app/components/EmployerDashboardSidebar';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

type SessionwithRole = {
  user: {
    role: string;
  };
};

export default function AppSidebar({
  isOpen,
  onClose,
  currentPath,
}: AppSidebarProps) {
  const { data: session } = authClient.useSession();

  const role = (session as SessionwithRole | null | undefined)?.user?.role;

  if (!session) {
    return (
      <Sidebar
        isOpen={isOpen}
        onClose={onClose}
      />
    );
  }

  switch (role) {
    case USER_ROLE.CANDIDATE:
      return (
        <CandidateDashboardSidebar
          isOpen={isOpen}
          onClose={onClose}
          currentPath={currentPath ?? ''}
        />
      );

    // case USER_ROLE.EMPLOYER:
    //   return (
    //     <EmployerDashboardSidebar
    //       isOpen={isOpen}
    //       onClose={onClose}
    //       currentPath={currentPath ?? ''}
    //     />
    //   );

    default:
      return (
        <Sidebar
          isOpen={isOpen}
          onClose={onClose}
        />
      );
  }
}