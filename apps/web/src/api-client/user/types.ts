// API Response: User Profile
export interface User {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null; // 'candidate', 'employer', 'admin', or custom role
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
}

/**
 * Response after successful user profile update
 */
export interface UpdateUserResponse {
  message: string;
}
