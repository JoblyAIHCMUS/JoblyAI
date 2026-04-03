import axios from 'axios';
import { UpdateUserDTO, UpdateUserResponse } from '@/api-client/user/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
