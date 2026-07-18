import { Injectable } from '@nestjs/common';
import { InterviewContext } from '../application/interview-context.model.js';

/** Maximum number of search queries to generate */
const MAX_QUERIES = 6;

@Injectable()
export class QueryGeneratorService {
  generateSearchQueries(context: InterviewContext): string[] {
    const companyName = this.clean(context.company);
    const roleName = this.clean(context.role);

    // Only use short, specific competency names — never full JD text
    const competencies = context.mustHaveCompetencies
      .slice(0, 5)
      .map((c) => this.clean(c));

    const queries = [
      // Core queries: company + role
      this.combineParts(companyName, roleName, 'interview questions'),
      this.combineParts(companyName, roleName, 'interview experience'),
      this.combineParts(roleName, 'common interview questions'),
      // Competency-specific queries (top 3 only)
      ...competencies
        .slice(0, 3)
        .map((c) => this.combineParts(roleName, c, 'interview questions')),
    ];

    return this.unique(
      queries.filter((query): query is string =>
        Boolean(query && query.length > 0)
      )
    ).slice(0, MAX_QUERIES);
  }

  private clean(value?: string | null): string {
    return (value ?? '').replace(/\s+/g, ' ').trim();
  }

  private combineParts(...parts: Array<string | null | undefined>): string {
    return parts
      .map((part) => this.clean(part))
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private unique(values: string[]): string[] {
    return [...new Set(values)];
  }
}
