import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const triggerAiAnalysis = async (resumeId: number) => {
  const response = await axios.post(`${API_BASE_URL}/api/ai/trigger-analysis`, { resumeId }, {
    withCredentials: true,
  });
  return response.data;
};

export const triggerAiParse = async (resumeId: number) => {
  const response = await axios.post(`${API_BASE_URL}/api/ai/trigger-parse`, { resumeId }, {
    withCredentials: true,
  });
  return response.data;
};

export const triggerAiScore = async (resumeId: number) => {
  const response = await axios.post(`${API_BASE_URL}/api/ai/trigger-score`, { resumeId }, {
    withCredentials: true,
  });
  return response.data;
};

export const commitResumeMerge = async (resumeId: number, data: any) => {
  const response = await axios.post(`${API_BASE_URL}/api/ai/commit-merge`, { resumeId, data }, {
    withCredentials: true,
  });
  return response.data;
};
