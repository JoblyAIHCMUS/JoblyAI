import { useAuth } from '@/hooks/useAuth';

import Sidebar from '@/app/components/landing/Sidebar';
import CandidateDashboardSidebar from '@/app/components/CandidateDashboardSidebar';
// import EmployerDashboardSidebar from '@/app/components/EmployerDashboardSidebar';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

export default function AppSidebar({
  isOpen,
  onClose,
  currentPath,
}: AppSidebarProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Sidebar isOpen={isOpen} onClose={onClose} />;
  }

  switch (role) {
    case 'candidate':
      return (
        <CandidateDashboardSidebar
          isOpen={isOpen}
          onClose={onClose}
          currentPath={currentPath ?? ''}
        />
      );

    // case 'employer':
    //   return (
    //     <EmployerDashboardSidebar
    //       isOpen={isOpen}
    //       onClose={onClose}
    //       currentPath={currentPath ?? ''}
    //     />
    //   );

    default:
      return <Sidebar isOpen={isOpen} onClose={onClose} />;
  }
}
