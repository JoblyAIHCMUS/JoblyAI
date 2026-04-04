import type { User } from '@/hooks/useUser';

export interface TeamMember {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

// Convert User to TeamMember format
export function convertUserToTeamMember(user: User | null): TeamMember | null {
  if (!user) return null;

  // Extract first and last name from the user's name
  const nameParts = user.name?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    firstName,
    lastName,
    email: user.email,
    role: 'Administrator',
    avatar: user.image || undefined,
  };
}

// Fallback mock user if actual user is not available
const mockCurrentUser: TeamMember = {
  firstName: 'Maria',
  lastName: 'Kelly',
  email: 'MariaKelly@email.com',
  role: 'Administrator',
};

export function getCurrentUser(): TeamMember {
  return mockCurrentUser;
}

const mockEmployers: TeamMember[] = [
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

export function searchEmployers(query: string): TeamMember[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return mockEmployers
    .filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(q) || user.email.toLowerCase().includes(q);
    })
    .slice(0, 5);
}
