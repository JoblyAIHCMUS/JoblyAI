import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import type { ParsedResume } from '../../../ai/resume-parser.service';
import {
  SyncResumeToProfileInputSchema,
  type SyncResumeToProfileInput,
} from './candidate.types';

const VALID_CONTACT_TYPES = new Set([
  'PHONE',
  'EMAIL',
  'FAX',
  'WEBSITE',
  'LINKEDIN',
  'GITHUB',
  'OTHER',
]);

const VALID_SOCIAL_PLATFORMS = new Set([
  'LINKEDIN',
  'GITHUB',
  'FACEBOOK',
  'TWITTER',
  'INSTAGRAM',
  'YOUTUBE',
  'TIKTOK',
  'DRIBBBLE',
  'BEHANCE',
  'OTHER',
]);

const DEGREE_MAP: Record<string, string> = {
  "bachelor's": 'BACHELOR',
  bachelor: 'BACHELOR',
  "master's": 'MASTER',
  master: 'MASTER',
  phd: 'PHD',
  doctorate: 'PHD',
  "associate's": 'ASSOCIATE',
  associate: 'ASSOCIATE',
  diploma: 'DIPLOMA',
  'high school': 'HIGH_SCHOOL',
  other: 'OTHER',
};

const EXPERIENCE_TYPE_MAP: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  fulltime: 'FULL_TIME',
  parttime: 'PART_TIME',
  contract: 'CONTRACT',
  internship: 'INTERNSHIP',
  freelance: 'FREELANCE',
  onsite: 'ONSITE',
  remote: 'REMOTE',
  hybrid: 'HYBRID',
  other: 'OTHER',
};

function normalizeDegree(value: unknown): string {
  if (typeof value !== 'string') return 'OTHER';
  const lower = value.toLowerCase().trim();
  for (const [key, enumVal] of Object.entries(DEGREE_MAP)) {
    if (lower.includes(key)) return enumVal;
  }
  return 'OTHER';
}

function normalizeExperienceType(value: unknown): string {
  if (typeof value !== 'string') return 'OTHER';
  const lower = value.toLowerCase().trim();
  for (const [key, enumVal] of Object.entries(EXPERIENCE_TYPE_MAP)) {
    if (lower.includes(key)) return enumVal;
  }
  return 'OTHER';
}

function sanitizeDate(value: unknown, fallback: string | null): string | null {
  if (typeof value !== 'string' || !value) return fallback;
  const d = new Date(value);
  if (isNaN(d.getTime())) return fallback;
  return value;
}

function sanitizeExperienceDates(items: unknown[]): unknown[] {
  return (items as Array<Record<string, unknown>>).map((e) => ({
    companyName:
      typeof e.companyName === 'string' && e.companyName
        ? e.companyName
        : typeof e.company === 'string' && e.company
          ? e.company
          : 'Independent',
    jobTitle:
      typeof e.jobTitle === 'string' && e.jobTitle
        ? e.jobTitle
        : typeof e.role === 'string' && e.role
          ? e.role
          : 'Unknown',
    description: typeof e.description === 'string' ? e.description : '',
    location: typeof e.location === 'string' ? e.location : '',
    startDate: sanitizeDate(e.startDate, '1970-01-01'),
    endDate: sanitizeDate(e.endDate, null),
    type: normalizeExperienceType(e.type),
  }));
}

function sanitizeEducationDates(items: unknown[]): unknown[] {
  return (items as Array<Record<string, unknown>>).map((e) => ({
    school:
      typeof e.school === 'string' && e.school
        ? e.school
        : typeof e.institution === 'string' && e.institution
          ? e.institution
          : 'Unknown',
    degree: normalizeDegree(e.degree),
    fieldOfStudy:
      typeof e.fieldOfStudy === 'string'
        ? e.fieldOfStudy
        : typeof e.field === 'string'
          ? e.field
          : '',
    startDate: sanitizeDate(e.startDate, '1970-01-01'),
    endDate: sanitizeDate(e.endDate, null),
    grade:
      typeof e.grade === 'string'
        ? e.grade
        : typeof e.gpa !== 'undefined'
          ? String(e.gpa)
          : '',
    description: typeof e.description === 'string' ? e.description : '',
  }));
}

function sanitizeCertificateDates(items: unknown[]): unknown[] {
  return (items as Array<Record<string, unknown>>).map((c) => ({
    name: typeof c.name === 'string' && c.name ? c.name : 'Certificate',
    issuer:
      typeof c.issuer === 'string' && c.issuer
        ? c.issuer
        : typeof c.issuer === 'string'
          ? c.issuer
          : 'Unknown',
    issueDate: sanitizeDate(c.issueDate, '1970-01-01'),
    expiryDate: sanitizeDate(c.expiryDate, null),
  }));
}

function sanitizeContacts(items: unknown[]): unknown[] {
  return (items as Array<Record<string, unknown>>)
    .filter((c) => typeof c.value === 'string' && c.value)
    .map((c) => {
      const upper =
        typeof c.type === 'string' ? c.type.toUpperCase() : 'OTHER';
      return {
        ...c,
        type: VALID_CONTACT_TYPES.has(upper) ? upper : 'OTHER',
      };
    });
}

function sanitizeSocials(items: unknown[]): unknown[] {
  return (items as Array<Record<string, unknown>>)
    .filter((s) => typeof s.url === 'string' && s.url)
    .map((s) => {
      const upper =
        typeof s.platform === 'string' ? s.platform.toUpperCase() : 'OTHER';
      return {
        ...s,
        platform: VALID_SOCIAL_PLATFORMS.has(upper) ? upper : 'OTHER',
      };
    });
}

export async function syncResumeToProfileHandler(
  state: McpState,
  input: SyncResumeToProfileInput
) {
  try {
    const resume = await state.prisma.resume.findUnique({
      where: { id: input.resumeId },
    });
    if (!resume) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Resume not found' }],
      };
    }
    if (resume.candidateId !== state.userId) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Access denied' }],
      };
    }

    const sanitized = {
      ...input.data,
      experience: sanitizeExperienceDates(input.data.experience),
      education: sanitizeEducationDates(input.data.education),
      certificates: sanitizeCertificateDates(input.data.certificates),
      contacts: sanitizeContacts(input.data.contacts),
      socials: sanitizeSocials(input.data.socials),
    } as unknown as ParsedResume;

    const result = await state.profileSyncService.commitMerge(
      state.userId,
      input.resumeId,
      sanitized
    );

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'sync_resume_to_profile tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerSyncResumeToProfileTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'sync_resume_to_profile',
    {
      description: `Persist agent-parsed resume data (title, bio, skills, experience, etc.) into the candidate profile. Step 3b of the upload flow.

Before calling this tool, parse the raw resume text into structured data using these EXTRACTION RULES:

1. SKILL CALCULATION & LEVEL:
   - 'years': Sum the durations (months/years) of all work experiences where the skill was explicitly used. Round to nearest integer.
   - MASTER: 7+ years of experience OR clear architectural/leadership impact with the skill.
   - ADVANCED: 4-7 years of experience OR specialized/deep technical implementation.
   - INTERMEDIATE: 2-4 years of experience OR consistent professional use.
   - BEGINNER: 1-2 years of experience OR limited professional exposure.
   - NOVICE: < 1 year of experience OR academic/personal project use only.

2. DATE HANDLING:
   - Standardize all dates to YYYY-MM-DD.
   - If only a year is provided, use YYYY-01-01.
   - If "Present" is used, set endDate to null.

3. ENUM STRICTNESS:
   - Degree: MUST be one of [HIGH_SCHOOL, DIPLOMA, ASSOCIATE, BACHELOR, MASTER, PHD, OTHER].
   - Experience Type: MUST be one of [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, ONSITE, REMOTE, HYBRID, OTHER].
   - Contact Type: MUST be one of [PHONE, EMAIL, FAX, WEBSITE, LINKEDIN, GITHUB, OTHER].
   - Social Platform: MUST be one of [LINKEDIN, GITHUB, FACEBOOK, TWITTER, INSTAGRAM, YOUTUBE, TIKTOK, DRIBBBLE, BEHANCE, OTHER].

4. MISSING DATA HANDLING:
   - If 'companyName' is missing: Look for project names or use 'Independent/Freelance/Personal Project' based on the description. Do NOT use 'unknown'.
   - If 'jobTitle' is missing: Infer from description.
   - If 'location' is missing: Use 'Unknown'.

5. CONTENT QUALITY:
   - 'bio': Summarize the candidate's professional identity into a punchy 2-3 sentence paragraph IF THERE IS NO BIO DESCRIPTION IN CV.

Pass the parsed result as the 'data' field matching this structure:
{
  "title": "string",
  "bio": "string",
  "skills": [{"name": "string", "years": number, "level": "ENUM"}],
  "education": [{"school": "string", "degree": "ENUM", "fieldOfStudy": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD|null", "grade": "string", "description": "string"}],
  "experience": [{"companyName": "string", "jobTitle": "string", "location": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD|null", "description": "string", "type": "ENUM"}],
  "contacts": [{"type": "ENUM", "value": "string"}],
  "socials": [{"platform": "ENUM", "url": "string"}],
  "certificates": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM-DD", "expiryDate": "YYYY-MM-DD|null"}]
}`,
      inputSchema: SyncResumeToProfileInputSchema,
      outputSchema: z.object({
        success: z.literal(true),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) =>
      syncResumeToProfileHandler(state, args as SyncResumeToProfileInput)
  );
}
