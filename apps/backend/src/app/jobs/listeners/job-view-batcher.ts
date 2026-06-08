import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../../decorators/inject.decorator';

const MAX_BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 250;

@Injectable()
export class JobViewBatcher implements OnModuleDestroy {
  private buffer: { jobId: number }[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

  add(jobId: number): void {
    this.buffer.push({ jobId });
    if (this.buffer.length >= MAX_BATCH_SIZE) {
      void this.flush();
      return;
    }
    if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), FLUSH_INTERVAL_MS);
    }
  }

  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.buffer.length === 0) return;

    const batch = this.buffer;
    this.buffer = [];

    try {
      await this.prisma.jobView.createMany({ data: batch });
    } catch (error) {
      console.error(
        `Failed to flush ${batch.length} job views; dropping batch:`,
        error
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.flush();
  }
}
