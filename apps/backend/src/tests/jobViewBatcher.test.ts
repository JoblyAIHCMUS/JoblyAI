import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JobViewBatcher } from '../app/jobs/listeners/job-view-batcher';

const mockPrisma = vi.hoisted(() => ({
  jobView: {
    createMany: vi.fn(),
  },
}));

describe('JobViewBatcher', () => {
  let batcher: JobViewBatcher;

  beforeEach(async () => {
    vi.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobViewBatcher,
        { provide: 'PRISMA_CLIENT', useValue: mockPrisma },
      ],
    }).compile();
    batcher = module.get<JobViewBatcher>(JobViewBatcher);
    mockPrisma.jobView.createMany.mockReset();
    mockPrisma.jobView.createMany.mockResolvedValue({ count: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes via createMany when buffer reaches 100 rows', async () => {
    for (let i = 1; i <= 100; i++) batcher.add(i);
    await vi.runOnlyPendingTimersAsync();
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledTimes(1);
    const call = mockPrisma.jobView.createMany.mock.calls[0][0];
    expect(call.data).toHaveLength(100);
    expect(call.data[0]).toEqual({ jobId: 1 });
    expect(call.data[99]).toEqual({ jobId: 100 });
  });

  it('flushes via createMany 250ms after the first add', async () => {
    batcher.add(42);
    expect(mockPrisma.jobView.createMany).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(250);
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledWith({
      data: [{ jobId: 42 }],
    });
  });

  it('does not flush on a second timer tick without new add calls', async () => {
    batcher.add(1);
    await vi.advanceTimersByTimeAsync(250);
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledTimes(1);
  });

  it('drops the batch and logs when createMany rejects', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // noop
    });
    mockPrisma.jobView.createMany.mockRejectedValueOnce(new Error('db down'));
    batcher.add(7);
    await vi.advanceTimersByTimeAsync(250);
    await Promise.resolve();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('accumulates concurrent add calls into the next batch while a flush is in flight', async () => {
    let resolveFirst: (v: { count: number }) => void = () => {
      // noop
    };
    mockPrisma.jobView.createMany
      .mockImplementationOnce(
        () => new Promise<{ count: number }>((res) => { resolveFirst = res; })
      )
      .mockResolvedValueOnce({ count: 0 });

    batcher.add(1);
    await vi.advanceTimersByTimeAsync(250);
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.jobView.createMany.mock.calls[0][0].data).toEqual([{ jobId: 1 }]);

    batcher.add(2);
    batcher.add(3);
    resolveFirst({ count: 1 });
    await Promise.resolve();
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(250);
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledTimes(2);
    expect(mockPrisma.jobView.createMany.mock.calls[1][0].data).toEqual([
      { jobId: 2 },
      { jobId: 3 },
    ]);
  });

  it('flushes pending rows on onModuleDestroy', async () => {
    batcher.add(99);
    expect(mockPrisma.jobView.createMany).not.toHaveBeenCalled();
    await batcher.onModuleDestroy();
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.jobView.createMany).toHaveBeenCalledWith({
      data: [{ jobId: 99 }],
    });
  });
});
