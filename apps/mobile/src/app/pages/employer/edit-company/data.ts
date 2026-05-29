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

// Convert CompanyEmployee to TeamMemberData format
export function convertCompanyEmployeeToTeamMember(
  employee: CompanyEmployee
): TeamMemberData {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    avatar: employee.avatarUrl || undefined,
    isEditable: true,
  };
}
