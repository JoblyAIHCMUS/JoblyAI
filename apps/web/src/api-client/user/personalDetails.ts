import axios from 'axios';

export interface UpdatePersonalDetailsPayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface UpdatePersonalDetailsResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Update user personal details (firstName, lastName)
 *
 * PATCH /api/user/me
 */
export async function updatePersonalDetails(
  payload: UpdatePersonalDetailsPayload
): Promise<UpdatePersonalDetailsResponse> {
  const response = await axios.patch<UpdatePersonalDetailsResponse>(
    `${API_BASE_URL}/api/user/me`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}
