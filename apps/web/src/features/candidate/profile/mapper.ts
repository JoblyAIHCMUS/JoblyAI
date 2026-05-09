import {
  CreateEducationPayload,
  UpdateEducationPayload,
  CreateExperiencePayload,
  UpdateExperiencePayload,
  CandidateProfileResponse,
} from '@/api-client/candidate';
import { CandidateEducation, CandidateExperience } from '@/types/candidate';
import { CandidateProfileUI } from './types';

export function mapUIToApiCreateEducation(
  education: CandidateEducation
): CreateEducationPayload {
  return {
    school: education.school,
    degree: education.degree,
    fieldOfStudy: education.fieldOfStudy || '',
    startDate: education.startDate,
    endDate: education.endDate,
    grade: education.grade,
    description: education.description,
  };
}

export function mapUIToApiUpdateEducation(
  education: CandidateEducation
): UpdateEducationPayload {
  return {
    id: education.id,
    ...mapUIToApiCreateEducation(education),
  };
}

export function mapUIToApiCreateExperience(
  exp: CandidateExperience
): CreateExperiencePayload {
  return {
    companyName: exp.companyName,
    jobTitle: exp.jobTitle,
    type: exp.type,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    description: exp.description,
  };
}

export function mapUIToApiUpdateExperience(
  exp: CandidateExperience
): UpdateExperiencePayload {
  return {
    id: exp.id,
    ...mapUIToApiCreateExperience(exp),
  };
}

export function mapDataToCandidate(
  data: CandidateProfileResponse
): CandidateProfileUI {
  // Convert about bio to array format for UI compatibility
  const aboutArray: string[] = data.about?.bio ? [data.about.bio] : [];

  // Combine firstName and lastName for display, fallback to name field
  const fullName =
    [data.firstName, data.lastName].filter(Boolean).join(' ').trim() ||
    data.name ||
    '';

  return {
    name: fullName,
    email: data.email || '',
    phone: data.phoneNumber || '',
    title: '', // Title is no longer stored in about section
    avatar: data.avatarUrl || '',
    banner: '#4640DE',
    openForOpportunities: data.openForOpportunities || false,
    about: aboutArray,
    experiences: data.experiences || [],
    educations: data.educations || [],
    skills: data.skills || [],
    certificates: data.certificates || [],
    portfolios: data.portfolios || [],
    contact: {
      email: data.email || '',
      phone: data.phoneNumber || '',
    },
    contacts: data.contacts || [],
    socials: data.socials || [],
  };
}
