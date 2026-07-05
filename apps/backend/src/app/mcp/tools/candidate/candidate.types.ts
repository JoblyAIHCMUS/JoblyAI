import { z } from 'zod';
import { ApplicationStatus, EmploymentType } from '@prisma/client';

export const SearchJobsInputSchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  type: z.array(z.enum(EmploymentType)).optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'VND', 'JPY', 'CNY']).optional(),
  skills: z.array(z.string()).optional(),
  categories: z.array(z.number().int()).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});
export type SearchJobsInput = z.infer<typeof SearchJobsInputSchema>;

export const ListMyApplicationsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  status: z.enum(ApplicationStatus).optional(),
});
export type ListMyApplicationsInput = z.infer<
  typeof ListMyApplicationsInputSchema
>;

export const GenerateUploadUrlInputSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
  fileSize: z.number().int().positive(),
});
export type GenerateUploadUrlInput = z.infer<
  typeof GenerateUploadUrlInputSchema
>;

export const CreateResumeRecordInputSchema = z.object({
  fileKey: z.string().min(1),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
  isDefault: z.boolean().optional(),
});
export type CreateResumeRecordInput = z.infer<
  typeof CreateResumeRecordInputSchema
>;

export const ExtractResumeTextInputSchema = z.object({
  resumeId: z.number().int().positive(),
});
export type ExtractResumeTextInput = z.infer<
  typeof ExtractResumeTextInputSchema
>;

const ParsedResumeSkillsSchema = z.array(
  z.object({
    name: z.string(),
    years: z.number().optional(),
    level: z.string().optional(),
  })
);

export const SyncResumeToProfileInputSchema = z.object({
  resumeId: z.number().int().positive(),
  data: z.object({
    title: z.string(),
    bio: z.string(),
    skills: ParsedResumeSkillsSchema,
    education: z.array(z.unknown()),
    experience: z.array(z.unknown()),
    contacts: z.array(z.unknown()),
    socials: z.array(z.unknown()),
    certificates: z.array(z.unknown()),
  }),
});
export type SyncResumeToProfileInput = z.infer<
  typeof SyncResumeToProfileInputSchema
>;

const AuditDetailSchema = z.object({
  status: z.enum(['excellent', 'needs_improvement', 'critical']),
  ruleName: z.string(),
  ruleSource: z.string(),
  critique: z.string(),
  brokenRulesExplanation: z.string(),
});

const ResumeEvaluationSchema = z.object({
  score: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  auditReport: z.object({
    impact: AuditDetailSchema,
    language: AuditDetailSchema,
  }),
  detailedStrengths: z.array(z.unknown()),
  detailedWeaknesses: z.array(z.unknown()),
  rewriteSuggestions: z.array(z.unknown()),
  generalAdvice: z.string(),
  formatting: z.string().optional(),
  impact: z.string().optional(),
});

export const SaveResumeScoreInputSchema = z.object({
  resumeId: z.number().int().positive(),
  score: z.number().min(0).max(100),
  feedback: ResumeEvaluationSchema,
});
export type SaveResumeScoreInput = z.infer<typeof SaveResumeScoreInputSchema>;
