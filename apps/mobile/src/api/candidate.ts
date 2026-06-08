import { apiClient } from './config';
import type { CandidateProfileResponse } from '../types/candidate';

export async function getCandidateProfile(): Promise<CandidateProfileResponse> {
  const response = await apiClient.get<CandidateProfileResponse>(
    '/candidate/me'
  );
  return response.data;
}

export interface UpdateAboutPayload {
  id?: number;
  bio?: string;
  title?: string;
}

export async function createCandidateAbout(
  payload: Omit<UpdateAboutPayload, 'id'>
): Promise<{ id: number; bio?: string; title?: string }> {
  const response = await apiClient.post('/candidate/me/about', payload);
  return response.data;
}

export async function updateCandidateAbout(
  payload: UpdateAboutPayload
): Promise<{ id: number; bio?: string; title?: string }> {
  const response = await apiClient.patch('/candidate/me/about', payload);
  return response.data;
}

export interface CreateExperiencePayload {
  jobTitle: string;
  companyName: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  type?: string;
}

export interface UpdateExperiencePayload
  extends Partial<CreateExperiencePayload> {
  id: number;
}

export async function createExperience(
  payload: CreateExperiencePayload
): Promise<any> {
  const response = await apiClient.post('/candidate/me/experience', payload);
  return response.data;
}

export async function updateExperience(
  payload: UpdateExperiencePayload
): Promise<any> {
  const response = await apiClient.patch('/candidate/me/experience', payload);
  return response.data;
}

export async function deleteExperience(experienceId: number): Promise<string> {
  const response = await apiClient.delete(
    `/candidate/me/experience/${experienceId}`
  );
  return response.data;
}

export interface CreateEducationPayload {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface UpdateEducationPayload
  extends Partial<CreateEducationPayload> {
  id: number;
}

export async function createEducation(
  payload: CreateEducationPayload
): Promise<any> {
  const response = await apiClient.post('/candidate/me/education', payload);
  return response.data;
}

export async function updateEducation(
  payload: UpdateEducationPayload
): Promise<any> {
  const response = await apiClient.patch('/candidate/me/education', payload);
  return response.data;
}

export async function deleteEducation(educationId: number): Promise<string> {
  const response = await apiClient.delete(
    `/candidate/me/education/${educationId}`
  );
  return response.data;
}

export interface UpdateCandidateProfilePayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  openForOpportunities?: boolean;
}

export async function updateCandidateProfile(
  payload: UpdateCandidateProfilePayload
): Promise<any> {
  const response = await apiClient.patch('/candidate/me', payload);
  return response.data;
}

export interface CreateCertificatePayload {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface UpdateCertificatePayload
  extends Partial<CreateCertificatePayload> {
  id: number;
}

export async function createCertificate(
  payload: CreateCertificatePayload
): Promise<any> {
  const response = await apiClient.post('/candidate/me/certification', payload);
  return response.data;
}

export async function updateCertificate(
  payload: UpdateCertificatePayload
): Promise<any> {
  const response = await apiClient.patch(
    '/candidate/me/certification',
    payload
  );
  return response.data;
}

export async function deleteCertificate(
  certificateId: number
): Promise<string> {
  const response = await apiClient.delete(
    `/candidate/me/certification/${certificateId}`
  );
  return response.data;
}

export interface CreateSkillPayload {
  title?: string;
  skillId?: number;
  level?: string;
  years?: number;
}

export async function createCandidateSkill(
  payload: CreateSkillPayload
): Promise<any> {
  const response = await apiClient.post('/candidate/me/skills', payload);
  return response.data;
}

export async function deleteCandidateSkill(skillId: number): Promise<string> {
  const response = await apiClient.delete(`/candidate/me/skills/${skillId}`);
  return response.data;
}
