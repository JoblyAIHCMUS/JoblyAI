import { apiClient } from './config';
import type {
  CandidateProfileResponse,
  CandidateResume,
} from '../types/candidate';

export interface ApiOptions {
  signal?: AbortSignal;
}

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

export interface UploadResumePayload {
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isDefault?: boolean;
}

export async function uploadResume(
  payload: UploadResumePayload
): Promise<CandidateResume> {
  const response = await apiClient.post<CandidateResume>(
    '/candidate/me/resume',
    payload
  );
  return response.data;
}

export async function deleteResume(
  resumeId: number,
  keepData = false
): Promise<string> {
  const response = await apiClient.delete(`/candidate/me/resume/${resumeId}`, {
    params: { keepData },
  });
  return response.data;
}

export async function setDefaultResume(
  resumeId: number
): Promise<CandidateResume> {
  const response = await apiClient.patch<CandidateResume>(
    '/candidate/me/resume',
    { id: resumeId, isDefault: true }
  );
  return response.data;
}

export async function createDownloadUrl(
  fileKey: string
): Promise<{ downloadUrl: string }> {
  const response = await apiClient.post('/s3/presigned-download', { fileKey });
  return response.data;
}

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string
): Promise<{
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresIn: number;
}> {
  const response = await apiClient.post('/s3/presigned-upload', {
    fileName,
    fileType,
    folder: 'resumes',
  });
  return response.data;
}

/**
 * Fetch a candidate's full profile by their user id.
 * Mirrors apps/web/src/api-client/candidate/profile.ts::getCandidateProfileById.
 * Used by the employer applicant-detail screen to load arbitrary applicants
 * (the existing getCandidateProfile only loads the logged-in user).
 */
export async function getCandidateProfileById(
  candidateId: string
): Promise<CandidateProfileResponse> {
  const response = await apiClient.get<CandidateProfileResponse>(
    `/candidate/${candidateId}`
  );
  return response.data;
}

export interface CreateResumePayload {
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isDefault?: boolean;
}

export interface UpdateResumePayload {
  id: number;
  fileKey?: string;
  fileName?: string;
  isDefault?: boolean;
}

export async function createResume(
  payload: CreateResumePayload
): Promise<CandidateResume> {
  const response = await apiClient.post<CandidateResume>(
    '/candidate/me/resume',
    payload
  );
  return response.data;
}

export async function updateResume(
  payload: UpdateResumePayload
): Promise<CandidateResume> {
  const response = await apiClient.patch<CandidateResume>(
    '/candidate/me/resume',
    payload
  );
  return response.data;
}

// --- Socials ---

export interface CreateSocialPayload {
  platform: string;
  url: string;
  username?: string;
}

export interface UpdateSocialPayload {
  id: number;
  platform?: string;
  url?: string;
  username?: string;
}

export async function createSocial(payload: CreateSocialPayload): Promise<any> {
  const response = await apiClient.post('/candidate/me/socials', payload);
  return response.data;
}

export async function updateSocial(payload: UpdateSocialPayload): Promise<any> {
  const response = await apiClient.patch('/candidate/me/socials', payload);
  return response.data;
}

export async function deleteSocial(id: number): Promise<any> {
  const response = await apiClient.delete(`/candidate/me/socials/${id}`);
  return response.data;
}

// --- Profile ---

export interface UpdateProfilePayload {
  phoneNumber?: string;
  openForOpportunities?: boolean;
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<any> {
  const response = await apiClient.patch('/candidate/me', payload);
  return response.data;
}
