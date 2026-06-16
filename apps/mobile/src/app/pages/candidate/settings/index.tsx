import SettingsScreen from '../../settings/SettingsScreen';
import { getFullName, useUser } from '../../../../hooks/useUser';
import { useGetCandidateProfile } from '../../../../hooks/useGetCandidateProfile';

export default function CandidateSettingsPage() {
  const { data: user } = useUser();
  const { data: profile } = useGetCandidateProfile();
  const name =
    profile?.name?.trim() ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() ||
    getFullName(user) ||
    'Candidate';

  return (
    <SettingsScreen
      role="candidate"
      account={{
        name,
        email: profile?.email || user?.email || '',
        avatarUrl: profile?.avatarUrl || user?.avatarUrl,
        caption: profile?.about?.title || 'Candidate account',
      }}
    />
  );
}
