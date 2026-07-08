import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import { SearchJobsInputSchema, type SearchJobsInput } from './candidate.types';

const outputSchema = z.object({
  jobs: z.array(z.unknown()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export async function searchJobsHandler(state: McpState, rawInput: unknown) {
  try {
    const input = SearchJobsInputSchema.parse(rawInput) as SearchJobsInput;
    const {
      q,
      location,
      type,
      remote,
      salaryMin,
      salaryMax,
      currency,
      skills,
      categories,
      page,
      pageSize,
    } = input;

    const whereClause: Prisma.JobPostingWhereInput = {
      deletedAt: null,
      status: 'OPEN',
    };

    if (q) {
      const searchTerms = q
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      if (searchTerms.length > 0) {
        const keywordConditions = searchTerms.map((term) => ({
          OR: [
            { title: { contains: term, mode: 'insensitive' as const } },
            { description: { contains: term, mode: 'insensitive' as const } },
            {
              company: {
                name: { contains: term, mode: 'insensitive' as const },
              },
            },
          ],
        }));

        if (whereClause.AND && Array.isArray(whereClause.AND)) {
          const existingConditions =
            whereClause.AND as Prisma.JobPostingWhereInput[];
          existingConditions.push(...keywordConditions);
        } else {
          whereClause.AND = keywordConditions;
        }
      }
    }

    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (remote !== undefined) whereClause.remote = remote;

    if (type && type.length > 0) {
      whereClause.type = { in: type };
    }

    if (categories && categories.length > 0) {
      whereClause.categoryId = { in: categories };
    }

    if (skills && skills.length > 0) {
      whereClause.requirements = {
        some: {
          skill: {
            name: { in: skills },
          },
        },
      };
    }

    if (salaryMin !== undefined || salaryMax !== undefined) {
      const salaryConditions: Prisma.JobPostingWhereInput[] = [];
      if (salaryMin !== undefined) {
        salaryConditions.push({
          OR: [{ salaryMax: { gte: salaryMin } }, { salaryMax: null }],
        });
      }
      if (salaryMax !== undefined) {
        salaryConditions.push({
          OR: [{ salaryMin: { lte: salaryMax } }, { salaryMin: null }],
        });
      }
      if (whereClause.AND && Array.isArray(whereClause.AND)) {
        (whereClause.AND as Prisma.JobPostingWhereInput[]).push(
          ...salaryConditions
        );
      } else {
        whereClause.AND = salaryConditions;
      }
    }

    if (currency) {
      if (whereClause.AND && Array.isArray(whereClause.AND)) {
        (whereClause.AND as Prisma.JobPostingWhereInput[]).push({ currency });
      } else {
        whereClause.AND = [{ currency }];
      }
    }

    const [total, jobs] = await state.prisma.$transaction([
      state.prisma.jobPosting.count({ where: whereClause }),
      state.prisma.jobPosting.findMany({
        where: whereClause,
        include: {
          category: true,
          company: true,
          requirements: { include: { skill: true } },
          preShortlistQuestions: { orderBy: { order: 'asc' } },
          _count: { select: { applications: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const result = {
      jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'search_jobs tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerSearchJobsTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'search_jobs',
    {
      description: 'Search open job postings (paginated, filtered).',
      inputSchema: SearchJobsInputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => searchJobsHandler(state, args)
  );
}
