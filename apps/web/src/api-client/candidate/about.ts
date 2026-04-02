import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function updateCandidateAbout(
  about: string[]
): Promise<{ about: string[] }> {
  return { about };
  const response = await axios.patch<{ about: string[] }>(
    `${API_BASE_URL}/api/candidate/me/about`,
    { about },
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}
