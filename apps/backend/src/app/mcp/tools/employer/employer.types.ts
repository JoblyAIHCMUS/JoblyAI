import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const ListJobsInputSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(10),
});
export type ListJobsInput = z.infer<typeof ListJobsInputSchema>;

export const ListApplicantsInputSchema = z.object({
  jobId: z.number().int().positive(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional(),
  status: z.enum(ApplicationStatus).optional(),
  search: z.string().optional(),
});
export type ListApplicantsInput = z.infer<typeof ListApplicantsInputSchema>;
