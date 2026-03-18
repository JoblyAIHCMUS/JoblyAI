// jobsAPI.ts
import axios from 'axios';

// Define the shape of the job creation payload (based on CreateJobDTO)
export interface JobRequirementInput {
  skillId: number;
  importance?: string; // RequirementImportance enum as string
  minYearsExperience?: number;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remote?: boolean;
  type?: string; // EmploymentType as string
  categoryId: number;
  companyName?: string;
  requirements?: JobRequirementInput[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createJobPosting(payload: CreateJobPayload) {
  const response = await axios.post(`${API_BASE_URL}/jobs`, payload, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  return response.data;
}
