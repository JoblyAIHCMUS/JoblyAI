import { SIMILAR_JOBS } from '@/mocks/similarJobs';
import type { SimilarJob } from '@/types/similarJob';

export const similarJobService = {
  getSimilarJobs(): SimilarJob[] {
    return SIMILAR_JOBS;
  },
};
