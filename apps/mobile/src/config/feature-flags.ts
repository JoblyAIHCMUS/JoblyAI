const envFlag = (key: string): boolean =>
  process.env[`EXPO_PUBLIC_${key}`] === 'true';

export const AI_FEATURE_FLAGS = {
  resumeParse: envFlag('AI_RESUME_PARSE'),
  resumeScore: envFlag('AI_RESUME_SCORE'),
  resumeScoreBadge: envFlag('AI_RESUME_SCORE'),
  resumeSync: envFlag('AI_RESUME_SYNC'),
  resumeFeedback: envFlag('AI_RESUME_FEEDBACK'),
  resumeDeleteImpact: envFlag('AI_RESUME_DELETE_IMPACT'),
  aiProcessingContext: envFlag('AI_PROCESSING_CONTEXT'),
} as const;

export type AiFeatureFlag = keyof typeof AI_FEATURE_FLAGS;

export const isAiEnabled = (flag: AiFeatureFlag): boolean =>
  AI_FEATURE_FLAGS[flag];
