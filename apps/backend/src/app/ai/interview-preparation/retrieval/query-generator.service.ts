import { Injectable } from '@nestjs/common';
import { InterviewContext } from '../application/interview-context.model.js';

@Injectable()
export class QueryGeneratorService {
  generateSearchQueries(context: InterviewContext): string[] {
    const companyName = this.clean(context.company);
    const roleName = this.clean(context.role);
    const keywords = this.unique(
      [...context.keywords, ...context.skills].map((value) => this.clean(value))
    );

    const queries = [
      this.combineParts(companyName, roleName, 'interview questions'),
      this.combineParts(companyName, roleName, 'interview experience'),
      this.combineParts(roleName, 'interview questions'),
      this.combineParts(roleName, 'interview experience'),
      ...keywords.flatMap((keyword) => [
        this.combineParts(companyName, keyword, 'interview questions'),
        this.combineParts(companyName, keyword, 'interview experience'),
        this.combineParts(roleName, keyword, 'interview questions'),
        this.combineParts(roleName, keyword, 'interview experience'),
        this.combineParts(keyword, 'interview questions'),
        this.combineParts(keyword, 'interview experience'),
      ]),
    ];

    return this.unique(
      queries.filter((query): query is string =>
        Boolean(query && query.length > 0)
      )
    );
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
