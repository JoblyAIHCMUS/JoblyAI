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

// Mock employers for search
export const mockEmployers: TeamMember[] = [
  {
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@acme.com',
    role: 'None',
  },
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@globex.com',
    role: 'None',
  },
  {
    firstName: 'Michael',
    lastName: 'Roberts',
    email: 'michael.roberts@initech.com',
    role: 'None',
  },
  {
    firstName: 'Emma',
    lastName: 'Nguyen',
    email: 'emma.nguyen@hooli.com',
    role: 'None',
  },
  {
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@piedpiper.com',
    role: 'None',
  },
  {
    firstName: 'Olivia',
    lastName: 'Taylor',
    email: 'olivia.taylor@waynetech.com',
    role: 'None',
  },
  {
    firstName: 'Daniel',
    lastName: 'Kim',
    email: 'daniel.kim@starkinds.com',
    role: 'None',
  },
  {
    firstName: 'Sophia',
    lastName: 'Brown',
    email: 'sophia.brown@umbrella.com',
    role: 'None',
  },
  {
    firstName: 'Ethan',
    lastName: 'Wilson',
    email: 'ethan.wilson@cyberdyne.com',
    role: 'None',
  },
  {
    firstName: 'Ava',
    lastName: 'Garcia',
    email: 'ava.garcia@oscorp.com',
    role: 'None',
  },
];

export const ROLE_OPTIONS = [
  { value: 'Administrator', label: 'Administrator' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Recruiter', label: 'Recruiter' },
  { value: 'None', label: 'None' },
];
