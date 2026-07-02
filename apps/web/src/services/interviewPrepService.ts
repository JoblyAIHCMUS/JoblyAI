import apiClient from '../lib/api';

export enum InterviewPrepStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface InterviewPrepQuestion {
  question: string;
  evidenceCount: number;
  sources: string[];
  contexts: string[];
}

export interface InterviewPreparation {
  id: string;
  candidateId: string;
  jobId: number;
  status: InterviewPrepStatus;
  questions: InterviewPrepQuestion[] | null;
  createdAt: string;
  updatedAt: string;
}

const interviewPrepService = {
  getPrep: async (jobId: number): Promise<InterviewPreparation> => {
    const response = await apiClient.get(`/interview-prep/${jobId}`);
    return response.data;
  },

  startPrep: async (jobId: number): Promise<InterviewPreparation> => {
    const response = await apiClient.post(`/interview-prep/${jobId}`);
    return response.data;
  },

  regeneratePrep: async (jobId: number): Promise<InterviewPreparation> => {
    const response = await apiClient.post(
      `/interview-prep/${jobId}/regenerate`
    );
    return response.data;
  },
};

export default interviewPrepService;
