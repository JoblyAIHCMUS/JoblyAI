export interface TeamMember {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface TeamMemberData extends TeamMember {
  isEditable?: boolean;
  membershipId?: number;
}

// Convert User to TeamMember format
export function convertUserToTeamMember(user: any): TeamMember | null {
  if (!user) return null;

  const nameParts = (user.fullName || user.name)?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    firstName,
    lastName,
    email: user.email,
    role: 'admin',
    avatar: user.image || user.avatarUrl || undefined,
  };
}
