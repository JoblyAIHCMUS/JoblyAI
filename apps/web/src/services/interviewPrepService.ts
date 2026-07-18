import apiClient from '../lib/api';

export enum InterviewPrepStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface PublicQuestion {
  question: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevance: string;
  confidence: number;
  sources: {
    title: string;
    url: string;
  }[];
  sampleAnswer: string;
  interviewerIntent: string;
  tips: string;
  origin: 'web_search' | 'ai_generated';
  reasoning?: string;
}

export interface GroupedQuestions {
  easy: PublicQuestion[];
  medium: PublicQuestion[];
  hard: PublicQuestion[];
}

export interface InterviewPreparation {
  id: string;
  candidateId: string;
  jobId: number;
  status: InterviewPrepStatus;
  questions: GroupedQuestions | null;
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
