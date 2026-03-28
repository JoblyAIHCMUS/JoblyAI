import axios from 'axios';
import { UpdateUserDTO, UpdateUserResponse } from '@/api-client/user/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Update the current authenticated user's basic profile information
 * (firstName, lastName)
 *
 * @param updateDto - Object containing firstName and/or lastName
 * @returns Promise with update response message
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
