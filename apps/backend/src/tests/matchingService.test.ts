import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchingService } from '../app/ai/matching.service';
import { GetJobsQueryDTO } from '../app/jobs/dto/getJobsQueryDTO';

const mockPrisma = {
  resume: {
    findUnique: vi.fn(),
  },
  $queryRawUnsafe: vi.fn(),
  jobPosting: {
    findMany: vi.fn(),
  },
};

const mockMatchExplanationService = {
  scoreResumeAgainstJobs: vi.fn(),
};

const makeJob = (preShortlistQuestions?: object[]) => ({
  id: 42,
  title: 'Backend Engineer',
  description: 'Build APIs.',
  salaryMin: 50000,
  salaryMax: 90000,
  preShortlistEnabled: true,
  requirements: [],
  _count: { applications: 3 },
  ...(preShortlistQuestions === undefined ? {} : { preShortlistQuestions }),
});

describe('MatchingService.findJobsForResume', () => {
  let service: MatchingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MatchingService(
      mockPrisma as any,
      mockMatchExplanationService as any
    );
  });

  const mockRecommendationQueries = (job: object) => {
    mockPrisma.resume.findUnique.mockResolvedValue({ id: 7 });
    mockPrisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ embedding: '[0.1,0.2]' }])
      .mockResolvedValueOnce([{ id: 42, full_count: '1' }]);
    mockPrisma.jobPosting.findMany.mockResolvedValue([job]);
    mockMatchExplanationService.scoreResumeAgainstJobs.mockResolvedValue(
      new Map()
    );
  };

  it('returns candidate-safe pre-shortlist questions for recommendations', async () => {
    const job = makeJob([
      {
        id: 'q1',
        order: 0,
        question: 'First question',
        expectedAnswer: 'private',
      },
      {
        id: 'q2',
        order: 1,
        question: 'Second question',
        expectedAnswer: 'also private',
      },
    ]);
    mockRecommendationQueries(job);

    const result = await service.findJobsForResume(7, {
      page: 1,
      pageSize: 10,
    } as GetJobsQueryDTO);

    expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          preShortlistQuestions: { orderBy: { order: 'asc' } },
        }),
      })
    );
    expect(result.jobs[0].preShortlistQuestions).toEqual([
      { id: 'q1', order: 0, question: 'First question' },
      { id: 'q2', order: 1, question: 'Second question' },
    ]);
  });

  it('returns an empty question array for questionless recommendations', async () => {
    const job = makeJob();
    mockRecommendationQueries(job);

    const result = await service.findJobsForResume(7, {
      page: 1,
      pageSize: 10,
    } as GetJobsQueryDTO);

    expect(result.jobs[0].preShortlistQuestions).toEqual([]);
  });
});
