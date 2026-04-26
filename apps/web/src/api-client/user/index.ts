import axios from 'axios';
import { User, UpdateUserDTO, UpdateUserResponse } from '@/api-client/user/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch the current authenticated user's profile
 *
 * @returns Promise with user profile data
 */
export async function getCurrentUserProfile(): Promise<User> {
  const response = await axios.get<User>(`${API_BASE_URL}/api/user/me`, {
    withCredentials: true,
  });
  return response.data;
}

/**
 * Update the current authenticated user's personal details
 * (firstName, lastName, phoneNumber, dateOfBirth, gender)
 *
 * @param updateDto - Object containing personal details to update
 * @returns Promise with updated user data
 */
export async function updateUserProfile(
  updateDto: UpdateUserDTO
): Promise<UpdateUserResponse> {
  const response = await axios.patch<UpdateUserResponse>(
    `${API_BASE_URL}/api/user/me`,
    updateDto,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}

export * from '@/api-client/user/types';
