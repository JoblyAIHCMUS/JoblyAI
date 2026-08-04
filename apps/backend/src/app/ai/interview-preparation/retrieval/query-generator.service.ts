import { Injectable } from '@nestjs/common';
import { InterviewContext } from '../application/interview-context.model.js';

/** Maximum number of search queries to generate */
const MAX_QUERIES = 10;

@Injectable()
export class QueryGeneratorService {
  generateSearchQueries(
    context: InterviewContext,
    whitelistDomains: string[] = []
  ): string[] {
    const companyName = this.clean(context.company);
    const roleName = this.clean(context.role);

    // Only use short, specific competency names — never full JD text
    const competencies = context.mustHaveCompetencies
      .slice(0, 5)
      .map((c) => this.clean(c));

    const siteQueries: string[] = [];

    // If whitelist domains are provided, shuffle and select a dynamic subset of top domains
    if (Array.isArray(whitelistDomains) && whitelistDomains.length > 0) {
      const shuffledDomains = this.shuffleArray(whitelistDomains);
      const topDomains = shuffledDomains.slice(0, 5);
      for (const domain of topDomains) {
        const normDomain = domain.trim().toLowerCase();
        if (!normDomain) continue;

        if (companyName) {
          siteQueries.push(
            `site:${normDomain} ${this.combineParts(
              companyName,
              roleName,
              'interview questions'
            )}`
          );
        } else {
          siteQueries.push(
            `site:${normDomain} ${this.combineParts(
              roleName,
              'interview questions'
            )}`
          );
        }
      }
    }

    const baseQueries = [
      ...siteQueries,
      // Core queries: company + role
      this.combineParts(companyName, roleName, 'interview questions'),
      this.combineParts(companyName, roleName, 'interview experience'),
      this.combineParts(roleName, 'common interview questions'),
      // Competency-specific queries (top 3)
      ...competencies
        .slice(0, 3)
        .map((c) => this.combineParts(roleName, c, 'interview questions')),
    ];

    return this.unique(
      baseQueries.filter((query): query is string =>
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

  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
