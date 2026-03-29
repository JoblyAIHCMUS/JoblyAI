import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';

export interface SkillResponse {
  id: number;
  name: string;
}

@Injectable()
export class SkillsService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

  /**
   * Find skills by their names (case-insensitive)
   */
  async findByNames(names: string[]): Promise<SkillResponse[]> {
    if (!names || names.length === 0) {
      return [];
    }

    // Normalize names: trim and lowercase for comparison
    const normalizedNames = names
      .map((n) => n.trim().toLowerCase())
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
    const trimmedName = name.trim();

    // Check if skill already exists (case-insensitive)
    const existing = await this.prisma.skill.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Create new skill
    const skill = await this.prisma.skill.create({
      data: {
        name: trimmedName,
      },
    });

    return skill;
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
      const trimmed = rawName.trim();
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
   * Search skills by query pattern
   */
  async searchSkills(query: string, limit = 10): Promise<SkillResponse[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.trim();

    // Search skills with name containing the query (case-insensitive)
    const skills = await this.prisma.skill.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    return skills;
  }
}
