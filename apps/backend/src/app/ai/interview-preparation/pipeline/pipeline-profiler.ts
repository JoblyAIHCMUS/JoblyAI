export class PipelineProfiler {
  private readonly timings: Map<string, number> = new Map();
  private currentStep: string | null = null;
  private currentStart = 0;
  private readonly startTotal: number;

  constructor() {
    this.startTotal = performance.now();
  }

  start(step: string): void {
    if (this.currentStep) {
      this.end();
    }
    this.currentStep = step;
    this.currentStart = performance.now();
  }

  end(): void {
    if (!this.currentStep) return;
    const duration = performance.now() - this.currentStart;
    const existing = this.timings.get(this.currentStep) ?? 0;
    this.timings.set(this.currentStep, existing + duration);
    this.currentStep = null;
  }

  getSummary(): Record<string, string> {
    if (this.currentStep) {
      this.end();
    }
    const summary: Record<string, string> = {};

    for (const [step, duration] of this.timings.entries()) {
      summary[step] = `${duration.toFixed(1)}ms`;
    }

    const actualTotal = performance.now() - this.startTotal;
    summary['Total (Overhead + Process)'] = `${actualTotal.toFixed(1)}ms`;

    return summary;
  }

  getTotalMs(): number {
    return performance.now() - this.startTotal;
  }
}
