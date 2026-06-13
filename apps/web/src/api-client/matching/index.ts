import axios from 'axios';
import { PaginatedJobsResponse, ListJobsQuery } from '@/api-client/jobs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const getResumeRecommendations = async (
  resumeId: number,
  query?: ListJobsQuery
): Promise<PaginatedJobsResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/matching/resume/${resumeId}/recommendations`,
    {
      params: query,
      withCredentials: true,
    }
  );
  return response.data;
};
