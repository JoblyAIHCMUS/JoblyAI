import {
  CreateEducationPayload,
  UpdateEducationPayload,
  CreateExperiencePayload,
  UpdateExperiencePayload,
  CreateCertificatePayload,
  UpdateCertificatePayload,
  CreateSocialPayload,
  UpdateSocialPayload,
  CreateContactPayload,
  UpdateContactPayload,
  CandidateProfileResponse,
} from '@/api-client/candidate';
import {
  CandidateEducation,
  CandidateExperience,
  CandidateCertificate,
  CandidateSocial,
  CandidateContact,
} from '@/types/candidate';
import { CandidateProfileUI } from './types';

export function mapUIToApiCreateContact(
  contact: CandidateContact
): CreateContactPayload {
  return {
    type: contact.type,
    value: contact.value,
    isPrimary: contact.isPrimary,
  };
}

export function mapUIToApiUpdateContact(
  contact: CandidateContact
): UpdateContactPayload {
  return {
    id: contact.id,
    ...mapUIToApiCreateContact(contact),
  };
}

export function mapUIToApiCreateSocial(
  social: CandidateSocial
): CreateSocialPayload {
  return {
    platform: social.platform,
    url: social.url,
    username: social.username,
  };
}

export function mapUIToApiUpdateSocial(
  social: CandidateSocial
): UpdateSocialPayload {
  return {
    id: social.id,
    ...mapUIToApiCreateSocial(social),
  };
}

export function mapUIToApiCreateCertificate(
  cert: CandidateCertificate
): CreateCertificatePayload {
  return {
    name: cert.name,
    issuer: cert.issuer,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    credentialId: cert.credentialId,
    url: cert.url,
  };
}

export function mapUIToApiUpdateCertificate(
  cert: CandidateCertificate
): UpdateCertificatePayload {
  return {
    id: cert.id,
    ...mapUIToApiCreateCertificate(cert),
  };
}

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
    title: data.about?.title || '', // Map title from about section
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
