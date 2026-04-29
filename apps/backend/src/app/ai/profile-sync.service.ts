import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ParsedResume } from './resume-parser.service';
import { AiProviderService } from './ai-provider.service';

@Injectable()
export class ProfileSyncService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly aiProvider: AiProviderService,
  ) {}

  private normalize(str: string): string {
    return str ? str.trim().toLowerCase() : '';
  }

  private async regenerateBio(rawDescriptions: Record<string, string>): Promise<string> {
    const sources = Object.values(rawDescriptions).filter(Boolean);
    if (sources.length === 0) return '';
    if (sources.length === 1) return sources[0];
    const prompt = `Combine these resume summaries into one professional bio (max 4 sentences): ${sources.join(' | ')}`;
    return this.aiProvider.generateText(prompt);
  }

  /**
   * Recalculates the aggregated values for a skill based on all linked resumes
   */
  private async recalculateSkillAggregate(tx: any, resumeIds: number[], skillName: string) {
    const resumes = await tx.resume.findMany({
      where: { id: { in: resumeIds } },
      select: { parsedText: true }
    });

    let totalYears = 0;
    let highestLevel = 'NOVICE';

    for (const res of resumes) {
      if (!res.parsedText) continue;
      const data = JSON.parse(res.parsedText) as ParsedResume;
      const skillMatch = data.skills.find(s => this.normalize(s.name) === this.normalize(skillName));
      if (skillMatch) {
        totalYears += (skillMatch.years || 0);
        highestLevel = this.compareSkillLevels(skillMatch.level as any, highestLevel as any);
      }
    }

    return { years: totalYears, level: highestLevel };
  }

  async commitMerge(candidateId: string, resumeId: number, data: ParsedResume) {
    // PRE-CALCULATE BIO OUTSIDE TRANSACTION (AI is slow)
    const currentDesc = await this.prisma.candidateDescription.findUnique({ where: { candidateId } });
    const rawDescriptions = (currentDesc?.rawDescriptions as Record<string, string>) || {};
    rawDescriptions[resumeId.toString()] = data.bio;
    const finalBio = await this.regenerateBio(rawDescriptions);

    return this.prisma.$transaction(async (tx) => {
      // Store raw JSON for future recalculations
      await tx.resume.update({ where: { id: resumeId }, data: { parsedText: JSON.stringify(data) } });

      // 1. Bio & Title
      await tx.candidateDescription.upsert({
        where: { candidateId },
        create: { candidateId, title: data.title, bio: finalBio, rawDescriptions },
        update: { title: data.title, bio: finalBio, rawDescriptions },
      });

      // 2. Skills with ADDITIVE Years
      for (const s of data.skills) {
        const skill = await tx.skill.upsert({ where: { name: this.normalize(s.name) }, create: { name: this.normalize(s.name) }, update: {} });
        const existing = await tx.candidateSkill.findUnique({ where: { candidateId_skillId: { candidateId, skillId: skill.id } } });
        
        const sourceCvIds = existing ? [...new Set([...existing.sourceCvIds, resumeId])] : [resumeId];
        
        // Recalculate based on all sources including the new one
        const { years, level } = await this.recalculateSkillAggregate(tx, sourceCvIds, s.name);

        await tx.candidateSkill.upsert({
          where: { candidateId_skillId: { candidateId, skillId: skill.id } },
          create: { candidateId, skillId: skill.id, level: level as any, years, sourceCvIds },
          update: { level: level as any, years, sourceCvIds }
        });
      }

      // 3. Experience & 4. Education (Keep current logic, de-duplication is fine there)
      for (const e of data.experience) {
        const existing = await tx.experience.findFirst({
          where: { candidateId, companyName: { equals: e.companyName, mode: 'insensitive' }, jobTitle: { equals: e.jobTitle, mode: 'insensitive' } }
        });
        if (existing) {
          await tx.experience.update({ where: { id: existing.id }, data: { sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])] } });
        } else {
          await tx.experience.create({
            data: { candidateId, companyName: e.companyName, jobTitle: e.jobTitle, location: e.location, startDate: new Date(e.startDate), endDate: e.endDate ? new Date(e.endDate) : null, description: e.description, type: e.type as any, sourceCvIds: [resumeId] }
          });
        }
      }

      for (const edu of data.education) {
        const existing = await tx.education.findFirst({
          where: { candidateId, school: { equals: edu.school, mode: 'insensitive' }, degree: edu.degree as any }
        });
        if (existing) {
          await tx.education.update({ where: { id: existing.id }, data: { sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])] } });
        } else {
          await tx.education.create({
            data: { candidateId, school: edu.school, degree: edu.degree as any, fieldOfStudy: edu.fieldOfStudy, startDate: new Date(edu.startDate), endDate: edu.endDate ? new Date(edu.endDate) : null, grade: edu.grade, description: edu.description, sourceCvIds: [resumeId] }
          });
        }
      }

      // 5. Collections
      await this.syncCollection(tx, 'candidateContact', data.contacts, candidateId, resumeId, (item) => ({ value: item.value, type: item.type }));
      await this.syncCollection(tx, 'candidateSocial', data.socials, candidateId, resumeId, (item) => ({ url: item.url, platform: item.platform }));
      await this.syncCollection(tx, 'certificate', data.certificates, candidateId, resumeId, (item) => ({ name: item.name, issuer: item.issuer }));

      await tx.resume.update({ where: { id: resumeId }, data: { isSyncedToProfile: true } });
      return { success: true };
    });
  }

  private async syncCollection(tx: any, model: string, items: any[], candidateId: string, resumeId: number, getMatchCriteria: (item: any) => any) {
    if (!items) return;
    for (const item of items) {
      const criteria = getMatchCriteria(item);
      const existing = await tx[model].findFirst({ where: { candidateId, ...criteria } });
      if (existing) {
        await tx[model].update({ where: { id: existing.id }, data: { sourceCvIds: [...new Set([...existing.sourceCvIds, resumeId])] } });
      } else {
        await tx[model].create({ data: { ...item, candidateId, sourceCvIds: [resumeId], 
          ...(item.issueDate ? { issueDate: new Date(item.issueDate) } : {}),
          ...(item.expiryDate ? { expiryDate: new Date(item.expiryDate) } : {})
        } });
      }
    }
  }

  async handleResumeDeletion(candidateId: string, resumeId: number) {
    // PRE-CALCULATE BIO CLEANUP OUTSIDE TRANSACTION (AI is slow)
    const desc = await this.prisma.candidateDescription.findUnique({ where: { candidateId } });
    let finalBio: string | null = null;
    let updatedRawDescriptions: Record<string, string> | null = null;

    if (desc?.rawDescriptions) {
      updatedRawDescriptions = { ...(desc.rawDescriptions as Record<string, string>) };
      delete updatedRawDescriptions[resumeId.toString()];
      finalBio = await this.regenerateBio(updatedRawDescriptions);
    }

    return this.prisma.$transaction(async (tx) => {
      const models = ['candidateSkill', 'experience', 'education', 'candidateContact', 'candidateSocial', 'certificate'];
      for (const model of models) {
        const records = await (tx as any)[model].findMany({ where: { candidateId, sourceCvIds: { has: resumeId } } });
        for (const record of records) {
          const remainingIds = record.sourceCvIds.filter((id: number) => id !== resumeId);
          if (remainingIds.length === 0) {
            await (tx as any)[model].delete({ where: { id: record.id } });
          } else {
            // RECALCULATION
            let updateData: any = { sourceCvIds: remainingIds };
            if (model === 'candidateSkill') {
              const skill = await tx.skill.findUnique({ where: { id: record.skillId } });
              const { years, level } = await this.recalculateSkillAggregate(tx, remainingIds, skill?.name || '');
              updateData = { ...updateData, years, level };
            } else if (model === 'experience' || model === 'education') {
              const bestData = await this.getBestRecordFromSources(tx, model, remainingIds, record);
              updateData = { ...updateData, ...bestData };
            }
            await (tx as any)[model].update({ where: { id: record.id }, data: updateData });
          }
        }
      }

      // Bio Cleanup (using pre-calculated data)
      if (updatedRawDescriptions !== null) {
        await tx.candidateDescription.update({
          where: { candidateId },
          data: { rawDescriptions: updatedRawDescriptions, bio: finalBio }
        });
      }

      return { success: true };
    });
  }

  private async getBestRecordFromSources(tx: any, model: string, remainingResumeIds: number[], currentRecord: any): Promise<any> {
    const resumes = await tx.resume.findMany({ where: { id: { in: remainingResumeIds } }, select: { parsedText: true } });
    const sourceDataList = resumes.map(r => JSON.parse(r.parsedText || '{}') as ParsedResume);
    const field = model === 'experience' ? 'experience' : 'education';
    const keyField = model === 'experience' ? 'companyName' : 'school';
    const matches = sourceDataList.flatMap(d => (d as any)[field]).filter(m => this.normalize(m[keyField]) === this.normalize(currentRecord[keyField]));
    return matches.reduce((best, curr) => (curr.description?.length > (best.description?.length || 0) ? curr : best), matches[0] || {});
  }

  private compareSkillLevels(a: string, b: string): string {
    const levels: Record<string, number> = { 'NOVICE': 0, 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3, 'MASTER': 4 };
    return (levels[a] || 0) >= (levels[b] || 0) ? a : b;
  }
}
