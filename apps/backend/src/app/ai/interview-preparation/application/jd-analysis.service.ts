import { Injectable } from '@nestjs/common';
import { InterviewContext } from './interview-context.model.js';

@Injectable()
export class JDAnalysisService {
  analyze(
    jobTitle?: string | null,
    companyName?: string | null,
    jobDescription?: string | null
  ): InterviewContext {
    return {
      company: this.normalize(companyName),
      role: this.normalize(jobTitle),
      skills: [],
      keywords: this.normalizeDescription(jobDescription),
    };
  }

  private normalize(value?: string | null): string | null {
    const trimmed = (value ?? '').trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeDescription(jobDescription?: string | null): string[] {
    const trimmed = (jobDescription ?? '').trim();

    return trimmed.length > 0 ? [trimmed] : [];
  }
}
