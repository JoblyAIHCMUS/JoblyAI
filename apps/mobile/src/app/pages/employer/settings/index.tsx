import SettingsScreen from '../../settings/SettingsScreen';
import { getFullName, useUser } from '../../../../hooks/useUser';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';

export default function EmployerSettingsPage() {
  const { data: user } = useUser();
  const { data: profile } = useGetEmployerProfile();

  return (
    <SettingsScreen
      role="employer"
      account={{
        name: profile?.fullName || getFullName(user) || 'Employer',
        email: profile?.email || user?.email || '',
        avatarUrl: profile?.avatarUrl || user?.avatarUrl,
        caption: profile?.company?.name || 'Employer account',
      }}
    />
  );
}
