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

export const GetPreShortlistQuestionsInputSchema = z.object({
  jobId: z.number().int().positive(),
});
export type GetPreShortlistQuestionsInput = z.infer<
  typeof GetPreShortlistQuestionsInputSchema
>;

export const AddPreShortlistQuestionsInputSchema = z.object({
  jobId: z.number().int().positive(),
  questions: z
    .array(
      z.object({
        question: z.string().min(5).max(10_000),
        expectedAnswer: z.string().min(1).max(10_000),
      })
    )
    .min(1)
    .max(20),
});
export type AddPreShortlistQuestionsInput = z.infer<
  typeof AddPreShortlistQuestionsInputSchema
>;

export const UpdatePreShortlistQuestionInputSchema = z
  .object({
    questionId: z.string(),
    question: z.string().min(5).max(10_000).optional(),
    expectedAnswer: z.string().min(1).max(10_000).optional(),
  })
  .refine((d) => d.question !== undefined || d.expectedAnswer !== undefined, {
    message: 'At least one of question or expectedAnswer must be provided',
  });
export type UpdatePreShortlistQuestionInput = z.infer<
  typeof UpdatePreShortlistQuestionInputSchema
>;

export const RemovePreShortlistQuestionsInputSchema = z.object({
  jobId: z.number().int().positive(),
  questionIds: z.array(z.string()).min(1).max(20),
});
export type RemovePreShortlistQuestionsInput = z.infer<
  typeof RemovePreShortlistQuestionsInputSchema
>;
