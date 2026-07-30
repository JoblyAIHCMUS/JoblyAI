import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SkillsService } from '../app/skills/skills.service';

const mockPrisma = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  skill: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

describe('SkillsService.searchSkills (typo-tolerant)', () => {
  let service: SkillsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SkillsService(mockPrisma as any);
  });

  describe('early-return edge cases (no DB call)', () => {
    it('returns [] for an empty string', async () => {
      const result = await service.searchSkills('');
      expect(result).toEqual([]);
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('returns [] for whitespace-only string', async () => {
      const result = await service.searchSkills('   ');
      expect(result).toEqual([]);
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('returns [] for null/undefined', async () => {
      expect(await service.searchSkills(null as any)).toEqual([]);
      expect(await service.searchSkills(undefined as any)).toEqual([]);
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('returns [] for 1- and 2-character queries (trigrams need 3+ chars)', async () => {
      expect(await service.searchSkills('a')).toEqual([]);
      expect(await service.searchSkills('ja')).toEqual([]);
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('with a valid (>=3 char) query', () => {
    it('calls $queryRaw exactly once and returns its result', async () => {
      const mockRows = [
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'Java' },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockRows);

      const result = await service.searchSkills('javascrpt');

      expect(result).toEqual(mockRows);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('does not call the old findMany-based code path', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.searchSkills('javascript');

      expect(mockPrisma.skill.findMany).not.toHaveBeenCalled();
    });

    it('trims the query before passing it to $queryRaw', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.searchSkills('   javascript   ');

      // Prisma's $queryRaw is a tagged template. When mocked, the strings
      // array is call arg [0] and each ${value} is a subsequent arg.
      const callArgs = mockPrisma.$queryRaw.mock.calls[0];
      const valueArgs = callArgs.slice(1);
      expect(valueArgs).toContain('javascript');
      expect(valueArgs).not.toContain('   javascript   ');
    });

    it('passes the original (trimmed) case to $queryRaw (lower() lives in the SQL)', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.searchSkills('JavaScript');

      const callArgs = mockPrisma.$queryRaw.mock.calls[0];
      const valueArgs = callArgs.slice(1);
      // We pass the original case; the SQL applies lower() on both sides.
      // If a future change pre-lowercases the value, this test will catch it.
      expect(valueArgs).toContain('JavaScript');
      expect(valueArgs).not.toContain('javascript');
    });

    it('passes the limit through to $queryRaw', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.searchSkills('javascript', 5);

      const callArgs = mockPrisma.$queryRaw.mock.calls[0];
      const valueArgs = callArgs.slice(1);
      expect(valueArgs).toContain(5);
    });

    it('uses default limit of 10 when none is provided', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.searchSkills('javascript');

      const callArgs = mockPrisma.$queryRaw.mock.calls[0];
      const valueArgs = callArgs.slice(1);
      expect(valueArgs).toContain(10);
    });

    it('returned rows preserve id and name fields', async () => {
      const mockRows = [
        { id: 42, name: 'PostgreSQL' },
        { id: 7, name: 'Postgres' },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockRows);

      const result = await service.searchSkills('postgrasql');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 42, name: 'PostgreSQL' });
      expect(result[1]).toEqual({ id: 7, name: 'Postgres' });
    });
  });
});
