import { CompanyEmployee } from '../../../../api/company';

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
    role: 'Administrator',
    avatar: user.image || user.avatarUrl || undefined,
  };
}

// Convert a CompanyEmployee (from GET /company/:id/employees) to a TeamMemberData.
// `ownerMembershipId` is Company.adminId - the owner always normalizes to role 'admin'
// regardless of the stored string. Everyone else normalizes to 'employee' unless their
// stored role is exactly 'admin'.
export function convertCompanyEmployeeToTeamMember(
  employee: CompanyEmployee,
  ownerMembershipId: number | null
): TeamMemberData {
  const isOwner =
    ownerMembershipId !== null && employee.membershipId === ownerMembershipId;
  const normalizedRole: 'admin' | 'employee' =
    employee.role === 'admin' || isOwner ? 'admin' : 'employee';

  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: normalizedRole,
    avatar: employee.avatarUrl || undefined,
    membershipId: employee.membershipId,
  };
}
