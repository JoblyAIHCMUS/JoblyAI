import { vi, describe, it, expect } from 'vitest';
import { JobViewListener } from '../app/jobs/listeners/job-view.listener';
import { JobViewedEvent } from '../app/jobs/events/job-viewed.event';

describe('JobViewListener', () => {
  it('delegates to batcher.add with the event jobId', () => {
    const mockBatcher = { add: vi.fn() };
    const listener = new JobViewListener(mockBatcher as any);
    listener.handleJobViewedEvent(new JobViewedEvent(42));
    expect(mockBatcher.add).toHaveBeenCalledTimes(1);
    expect(mockBatcher.add).toHaveBeenCalledWith(42);
  });
});
