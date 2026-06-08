import axios from 'axios';
import { PaginatedJobsResponse } from '@/api-client/jobs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const getResumeRecommendations = async (resumeId: number, limit: number = 10): Promise<PaginatedJobsResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/matching/resume/${resumeId}/recommendations`,
    {
      params: { limit },
      withCredentials: true,
    }
  );
  return response.data;
};
