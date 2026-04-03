// API Response: User Profile
export interface User {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  emailVerified: boolean;
  image?: string | null;
  avatarUrl?: string | null;
  role?: string | null; // 'candidate', 'employer', 'admin', or custom role
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Payload for updating user personal details
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO 8601 date string (YYYY-MM-DD)
  gender?: string;
}

/**
 * Response after successful user profile update
 * Contains the updated user data
 */
export interface UpdateUserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO 8601 date string (YYYY-MM-DD)
  gender?: string;
  avatarUrl?: string;
}
