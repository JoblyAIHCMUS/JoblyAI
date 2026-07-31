import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';

export interface SkillResponse {
  id: number;
  name: string;
}

@Injectable()
export class SkillsService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

  private normalizeSkillName(skillName: string): string {
    return skillName.trim().replace(/\s+/g, ' ');
  }

  private async findSkillByNameInsensitive(
    normalizedSkillName: string
  ): Promise<SkillResponse | null> {
    return this.prisma.skill.findFirst({
      where: {
        name: {
          equals: normalizedSkillName,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Find skills by their names (case-insensitive)
   */
  async findByNames(names: string[]): Promise<SkillResponse[]> {
    if (!names || names.length === 0) {
      return [];
    }

    // Normalize names: trim and lowercase for comparison
    const normalizedNames = names
      .map((n) => this.normalizeSkillName(n).toLowerCase())
      .filter((n) => n.length > 0);

    // Remove duplicates
    const uniqueNames = Array.from(new Set(normalizedNames));

    // Query skills - case-insensitive match
    const skills = await this.prisma.skill.findMany({
      where: {
        name: {
          in: uniqueNames,
          mode: 'insensitive',
        },
      },
    });

    return skills;
  }

  /**
   * Create a new skill
   */
  async createSkill(name: string): Promise<SkillResponse> {
    const normalizedName = this.normalizeSkillName(name);

    // Check if skill already exists (case-insensitive)
    const existing = await this.findSkillByNameInsensitive(normalizedName);

    if (existing) {
      return existing;
    }

    try {
      // Create new skill only when missing
      const skill = await this.prisma.skill.create({
        data: {
          name: normalizedName,
        },
      });

      return skill;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const resolved = await this.findSkillByNameInsensitive(normalizedName);
        if (resolved) {
          return resolved;
        }
      }

      throw error;
    }
  }

  /**
   * Get or create multiple skills by names
   */
  async getOrCreateSkills(names: string[]): Promise<SkillResponse[]> {
    if (!names || names.length === 0) {
      return [];
    }

    // Normalize and deduplicate names
    const normalizedToOriginal = new Map<string, string>();
    for (const rawName of names) {
      const trimmed = this.normalizeSkillName(rawName);
      const normalized = trimmed.toLowerCase();
      if (normalized.length > 0 && !normalizedToOriginal.has(normalized)) {
        normalizedToOriginal.set(normalized, trimmed);
      }
    }

    const uniqueNames = Array.from(normalizedToOriginal.values());

    // 1. Find existing skills
    const existing = await this.findByNames(uniqueNames);
    const foundNames = new Set(existing.map((s) => s.name.toLowerCase()));

    // 2. Create missing skills
    const toCreate = uniqueNames.filter(
      (n) => !foundNames.has(n.toLowerCase())
    );

    const created: SkillResponse[] = await Promise.all(
      toCreate.map((name) => this.createSkill(name))
    );

    return [...existing, ...created];
  }

  /**
   * Minimum word_similarity() score (0..1) for a row to be returned.
   * 0.4 catches up to 2-character typos on 8+ char queries
   * (e.g. "javascrpt" -> "JavaScript" ~0.7, "postgrasql" -> "PostgreSQL" ~0.57)
   * while still dropping noise on unrelated terms.
   */
  private static readonly SKILL_SEARCH_SIMILARITY_THRESHOLD = 0.4;

  /**
   * Search skills by name with 1-2 character typo tolerance, ranked by
   * similarity. Uses PostgreSQL pg_trgm's word_similarity() against a
   * functional GIN index on lower("name") (see migration
   * 20260730090000_add_pg_trgm_skill_index).
   *
   * Returns [] for empty / whitespace / < 3 char queries (trigrams need
   * at least 3 characters; the UI gracefully shows an empty dropdown).
   */
  async searchSkills(query: string, limit = 10): Promise<SkillResponse[]> {
    const trimmed = query?.trim() ?? '';
    if (trimmed.length < 3) return [];

    // Filter via word_similarity() directly (NOT the `%>` operator).
    //
    // We originally used the `%>` operator as a prefilter, but it is bound
    // to the `pg_trgm.word_similarity_threshold` GUC, which defaults to
    // 0.6 server-wide — that made it impossible to lower the threshold
    // without a session-level SET. The explicit `word_similarity() > X`
    // predicate gives us full control of the threshold.
    //
    // word_similarity(arg1, arg2) = greatest similarity between arg1 and
    // any continuous extent of arg2. We MUST use the same arg order in
    // WHERE and ORDER BY so ranking is consistent with filtering.
    //
    // Per pg_trgm docs, `word_similarity()` + `LIMIT` triggers a GIN
    // index nearest-neighbor scan, so performance is comparable to the
    // `%>`-based plan.
    const rows = await this.prisma.$queryRaw<
      Array<{ id: number; name: string }>
    >`
      SELECT id, name
      FROM "Skill"
      WHERE word_similarity(lower(${trimmed}), lower("name"))
          > ${SkillsService.SKILL_SEARCH_SIMILARITY_THRESHOLD}
      ORDER BY word_similarity(lower(${trimmed}), lower("name")) DESC, name ASC
      LIMIT ${limit}
    `;

    return rows;
  }
}
